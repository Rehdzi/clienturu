import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { Address } from 'src/addresses/address.model';
import { Organization } from 'src/organization/organization.model';
import { Role } from 'src/roles/roles.model';
import { OWNER_ROLE_VALUE } from 'src/roles/roles.constants';
import { UserRoles } from 'src/roles/user-roles-model';
import { User } from 'src/users/users/users.model';
import { CreateOwnerApplicationDto } from './dto/create-owner-application.dto';
import {
  OwnerApplication,
  OwnerApplicationStatus,
} from './owner-application.model';

@Injectable()
export class OwnerApplicationsService {
  constructor(
    @InjectModel(OwnerApplication)
    private applicationRepository: typeof OwnerApplication,
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
    @InjectModel(Address)
    private addressRepository: typeof Address,
    @InjectModel(Role)
    private roleRepository: typeof Role,
    @InjectModel(UserRoles)
    private userRolesRepository: typeof UserRoles,
    private sequelize: Sequelize,
  ) {}

  async submit(userId: number, dto: CreateOwnerApplicationDto) {
    const pending = await this.applicationRepository.findOne({
      where: { userId, status: 'pending' },
    });
    if (pending) {
      throw new ConflictException('You already have a pending application');
    }
    const ownedOrg = await this.organizationRepository.findOne({
      where: { ownerId: userId },
    });
    if (ownedOrg) {
      throw new ConflictException('You already own an organization');
    }
    return this.applicationRepository.create({ ...dto, userId });
  }

  async listMine(userId: number) {
    return this.applicationRepository.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async listAll(filters: { status?: OwnerApplicationStatus } = {}) {
    const where: Record<string, unknown> = {};
    if (filters.status) {
      where.status = filters.status;
    }
    return this.applicationRepository.findAll({
      where,
      include: [
        { model: User, as: 'applicant' },
        { model: User, as: 'reviewer' },
      ],
      order: [['createdAt', 'ASC']],
    });
  }

  async getById(id: number, user: AccessTokenPayload, isAdminCaller: boolean) {
    const application = await this.applicationRepository.findByPk(id, {
      include: [
        { model: User, as: 'applicant' },
        { model: User, as: 'reviewer' },
      ],
    });
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    if (!isAdminCaller && application.userId !== user.sub) {
      throw new ForbiddenException('Not allowed');
    }
    return application;
  }

  async approve(id: number, reviewer: AccessTokenPayload) {
    return this.sequelize.transaction(async (transaction) => {
      const application = await this.applicationRepository.findByPk(id, {
        transaction,
      });
      if (!application) {
        throw new NotFoundException(`Application with id ${id} not found`);
      }
      if (application.status !== 'pending') {
        throw new ConflictException('Application is not pending');
      }

      const organization = await this.organizationRepository.create(
        {
          name: application.orgName,
          phone: application.orgPhone,
          email: application.orgEmail ?? undefined,
          ownerId: application.userId,
        },
        { transaction },
      );
      // Newly approved orgs go live immediately — admin already vetted the application.
      await organization.update({ status: 'active' }, { transaction });

      await this.addressRepository.create(
        {
          organizationId: organization.id,
          city: application.addressCity,
          street: application.addressStreet,
          label: application.addressLabel ?? undefined,
          latitude: application.latitude ?? undefined,
          longitude: application.longitude ?? undefined,
          isPrimary: true,
        },
        { transaction },
      );

      const ownerRole = await this.roleRepository.findOne({
        where: { value: OWNER_ROLE_VALUE },
        transaction,
      });
      if (ownerRole) {
        const existing = await this.userRolesRepository.findOne({
          where: { userId: application.userId, roleId: ownerRole.id },
          transaction,
        });
        if (!existing) {
          await this.userRolesRepository.create(
            { userId: application.userId, roleId: ownerRole.id } as never,
            { transaction },
          );
        }
      }

      await application.update(
        {
          status: 'approved',
          reviewedBy: reviewer.sub,
          reviewedAt: new Date(),
        },
        { transaction },
      );

      return application.reload({
        include: [
          { model: User, as: 'applicant' },
          { model: User, as: 'reviewer' },
        ],
        transaction,
      });
    });
  }

  async reject(id: number, reviewer: AccessTokenPayload, reason: string) {
    const application = await this.applicationRepository.findByPk(id);
    if (!application) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    if (application.status !== 'pending') {
      throw new ConflictException('Application is not pending');
    }
    return application.update({
      status: 'rejected',
      rejectionReason: reason,
      reviewedBy: reviewer.sub,
      reviewedAt: new Date(),
    });
  }
}
