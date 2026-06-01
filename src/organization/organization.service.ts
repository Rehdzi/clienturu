import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { isAdmin } from 'src/roles/roles.constants';
import { Organization } from './organization.model';
import { Address } from 'src/addresses/address.model';
import { Service } from 'src/services/service.model';

export interface OrganizationListFilters {
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  q?: string;
}

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
    private sequelize: Sequelize,
  ) {}

  // Single source of truth for org-ownership authorization. Throws 404 if the
  // organization is missing, 403 unless the user owns it (or is an Admin), and
  // otherwise returns the organization for the caller to use.
  async assertCanManage(
    organizationId: number,
    user: AccessTokenPayload,
  ): Promise<Organization> {
    const organization =
      await this.organizationRepository.findByPk(organizationId);
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    // Admins bypass ownership entirely; everyone else must be the owner.
    if (isAdmin(user.roles)) {
      return organization;
    }
    if (organization.ownerId !== user.sub) {
      throw new ForbiddenException(
        'Only the organization owner can perform this action',
      );
    }
    return organization;
  }

  async createOrganization(
    dto: CreateOrganizationDto,
    user: AccessTokenPayload,
  ) {
    const { addresses, ...orgFields } = dto;

    // Without any addresses the create is a single INSERT — no need to spin up
    // a transaction for it.
    if (!addresses || addresses.length === 0) {
      return this.organizationRepository.create({
        ...orgFields,
        ownerId: user.sub,
      });
    }

    // Normalize the "at most one primary" invariant the same way the addresses
    // service does at write time: if the client sent multiple primaries, only
    // the FIRST one wins; the rest are demoted before the INSERT batch.
    let seenPrimary = false;
    const normalized = addresses.map((address) => {
      if (address.isPrimary && !seenPrimary) {
        seenPrimary = true;
        return { ...address, isPrimary: true };
      }
      return { ...address, isPrimary: false };
    });

    return this.sequelize.transaction(async (transaction) => {
      const organization = await this.organizationRepository.create(
        { ...orgFields, ownerId: user.sub },
        { transaction },
      );
      await Address.bulkCreate(
        normalized.map((address) => ({
          ...address,
          organizationId: organization.id,
        })),
        { transaction },
      );
      return organization.reload({ include: [Address], transaction });
    });
  }

  // Private list for the management UI. Admins see everything (so they can
  // moderate any org); regular users only see orgs they own. Pending/rejected
  // orgs are included — that's the whole point of this endpoint vs `/all`.
  async getMyOrganizations(user: AccessTokenPayload) {
    const where: Record<string, unknown> = isAdmin(user.roles)
      ? {}
      : { ownerId: user.sub };
    return this.organizationRepository.findAll({
      where,
      include: [Address],
      order: [['id', 'ASC']],
    });
  }

  // Private detail for the management UI. Returns orgs in ANY status, gated by
  // ownership (admins bypass). 404 -> not found, 403 -> exists but caller is
  // neither owner nor admin.
  async getMyOrganizationById(id: number, user: AccessTokenPayload) {
    const organization = await this.organizationRepository.findByPk(id, {
      include: [Address, Service],
    });
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    if (!isAdmin(user.roles) && organization.ownerId !== user.sub) {
      throw new ForbiddenException(
        'Only the organization owner can view this resource',
      );
    }
    return organization;
  }

  // Public catalog listing. Returns only `active` organizations and supports
  // optional filtering by city (case-insensitive exact match), free-text search
  // across org name and address city, and geo radius via PostGIS ST_DWithin
  // (geography). Default ordering is by rating DESC (NULLS LAST), id ASC; when
  // geo is provided we instead order by ST_Distance ASC so the closest org
  // comes first.
  async getAllOrganizations(filters: OrganizationListFilters = {}) {
    const { city, lat, lng, radiusKm, q } = filters;
    const hasGeo =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      typeof radiusKm === 'number';
    const hasCity = typeof city === 'string' && city.length > 0;
    const hasQuery = typeof q === 'string' && q.length > 0;

    const where: Record<string, unknown> = { status: 'active' };
    if (hasQuery) {
      // Free-text `q` matches either the org name OR a nested address city.
      // The nested column reference must use Sequelize's `$path$` syntax;
      // `subQuery: false` below keeps it from being aliased into a subselect.
      where[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { '$addresses.city$': { [Op.iLike]: `%${q}%` } },
      ];
    }

    const addressWhere: Record<string, unknown> = {};
    if (hasCity) {
      addressWhere.city = { [Op.iLike]: city };
    }
    if (hasGeo) {
      // PostGIS geography-based radius search. The `geom` column is maintained
      // by a BEFORE INSERT/UPDATE trigger that syncs it from latitude/longitude
      // — Sequelize never sees it as an attribute.
      addressWhere[Op.and as unknown as string] = literal(
        `ST_DWithin("addresses"."geom", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)`,
      );
    }

    return this.organizationRepository.findAll({
      where,
      include: [
        {
          model: Address,
          // INNER JOIN when filtering OR free-text searching nested column,
          // LEFT JOIN otherwise so orgs without an address are still listed in
          // the unfiltered catalog. `required: false` for q-only avoids
          // dropping orgs whose match is solely on the org's own name.
          required: hasCity || hasGeo,
          where:
            hasCity || hasGeo
              ? (addressWhere as Record<string, unknown>)
              : undefined,
        },
      ],
      // Required when including a hasMany with WHERE so LIMIT/sort survive,
      // and so the `$addresses.city$` reference resolves to a flat JOIN.
      subQuery: false,
      replacements: hasGeo
        ? { lat, lng, radiusMeters: (radiusKm as number) * 1000 }
        : undefined,
      order: hasGeo
        ? literal(
            `ST_Distance("addresses"."geom", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) ASC`,
          )
        : literal(`"Organization"."rating" DESC NULLS LAST, "Organization"."id" ASC`),
    });
  }

  // Public detail endpoint. Pending organizations are hidden as 404 rather
  // than 403 to avoid leaking their existence to anonymous callers.
  async getOrganizationById(id: number) {
    const organization = await this.organizationRepository.findByPk(id, {
      include: [Address, Service],
    });
    if (!organization || organization.status !== 'active') {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return organization;
  }

  // Admin-only: flip a pending org to active (and vice-versa for reject).
  async approveOrganization(id: number) {
    const organization = await this.organizationRepository.findByPk(id);
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return organization.update({ status: 'active' });
  }

  async rejectOrganization(id: number) {
    const organization = await this.organizationRepository.findByPk(id);
    if (!organization) {
      throw new NotFoundException(`Organization with id ${id} not found`);
    }
    return organization.update({ status: 'pending' });
  }
}
