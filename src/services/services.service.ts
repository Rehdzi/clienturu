import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, literal } from 'sequelize';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { OrganizationService } from 'src/organization/organization.service';
import { Organization } from 'src/organization/organization.model';
import { Address } from 'src/addresses/address.model';
import { Service } from './service.model';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

export interface ServiceCatalogFilters {
  city?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  q?: string;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service) private serviceRepository: typeof Service,
    private organizationService: OrganizationService,
  ) {}

  async createService(dto: CreateServiceDto, user: AccessTokenPayload) {
    // Only the owner of the target organization (or an Admin) may add services.
    await this.organizationService.assertCanManage(dto.organizationId, user);
    const service = await this.serviceRepository.create(dto);
    return service;
  }

  async getServicesByOrganization(organizationId: number) {
    return this.serviceRepository.findAll({ where: { organizationId } });
  }

  // Public catalog: flat list of services from active organizations only.
  // Optional filters: name search, city, geo radius (haversine).
  async getAllServices(filters: ServiceCatalogFilters = {}) {
    const { city, lat, lng, radiusKm, q } = filters;
    const hasGeo =
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      typeof radiusKm === 'number';
    const hasCity = typeof city === 'string' && city.length > 0;
    const hasQuery = typeof q === 'string' && q.length > 0;

    const serviceWhere: Record<string, unknown> = { isActive: true };
    if (hasQuery) {
      // Free-text `q` matches the service name OR the parent organization name.
      // `$organization.name$` is Sequelize's "reference a column on this
      // include" syntax; it requires `subQuery: false` so the include becomes a
      // flat JOIN instead of being aliased into a subselect.
      serviceWhere[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${q}%` } },
        { '$organization.name$': { [Op.iLike]: `%${q}%` } },
      ];
    }

    const addressWhere: Record<string, unknown> = {};
    if (hasCity) {
      addressWhere.city = { [Op.iLike]: city };
    }
    if (hasGeo) {
      // PostGIS geography radius — `geom` is server-managed by a trigger that
      // syncs it from latitude/longitude.
      addressWhere[Op.and as unknown as string] = literal(
        `ST_DWithin("organization->addresses"."geom", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusMeters)`,
      );
    }

    return this.serviceRepository.findAll({
      where: serviceWhere,
      include: [
        {
          model: Organization,
          required: true,
          where: { status: 'active' },
          attributes: ['id', 'name', 'rating'],
          include: [
            {
              model: Address,
              required: hasCity || hasGeo,
              where:
                hasCity || hasGeo
                  ? (addressWhere as Record<string, unknown>)
                  : undefined,
            },
          ],
        },
      ],
      subQuery: false,
      replacements: hasGeo
        ? { lat, lng, radiusMeters: (radiusKm as number) * 1000 }
        : undefined,
      // Default: highest-rated orgs first (NULLS LAST), tiebreak by id. With a
      // geo filter we instead sort by distance ASC so closest results come up.
      order: hasGeo
        ? literal(
            `ST_Distance("organization->addresses"."geom", ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) ASC`,
          )
        : literal(`"organization"."rating" DESC NULLS LAST, "Service"."id" ASC`),
    });
  }

  async getServiceById(id: number) {
    const service = await this.serviceRepository.findByPk(id);
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  async updateService(
    id: number,
    dto: UpdateServiceDto,
    user: AccessTokenPayload,
  ) {
    const service = await this.getServiceById(id);
    await this.organizationService.assertCanManage(
      service.organizationId,
      user,
    );
    return service.update(dto);
  }

  async deleteService(id: number, user: AccessTokenPayload) {
    // Soft-delete: future bookings will reference services, so we must not orphan
    // historical data by hard-deleting. We simply mark the service inactive.
    const service = await this.getServiceById(id);
    await this.organizationService.assertCanManage(
      service.organizationId,
      user,
    );
    return service.update({ isActive: false });
  }
}
