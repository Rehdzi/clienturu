import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';
import { OrganizationService } from 'src/organization/organization.service';
import { Service } from 'src/services/service.model';
import { RolesService } from 'src/roles/roles.service';
import { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { OrganizationStaff } from './organization-staff.model';
import { StaffService as StaffServiceModel } from './staff-service.model';
import { Schedule } from './schedule.model';
import { SetStaffServicesDto } from './dto/set-staff-services.dto';
import { SetScheduleDto } from './dto/set-schedule.dto';

// Value of the role assigned to any user who acts as a master/staff member.
export { STAFF_ROLE_VALUE } from 'src/roles/roles.constants';
import { STAFF_ROLE_VALUE } from 'src/roles/roles.constants';

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(OrganizationStaff)
    private organizationStaffRepository: typeof OrganizationStaff,
    @InjectModel(StaffServiceModel)
    private staffServiceRepository: typeof StaffServiceModel,
    @InjectModel(Schedule) private scheduleRepository: typeof Schedule,
    @InjectModel(User) private userRepository: typeof User,
    @InjectModel(Organization)
    private organizationRepository: typeof Organization,
    @InjectModel(Service) private serviceRepository: typeof Service,
    private rolesService: RolesService,
    private organizationService: OrganizationService,
  ) {}

  async assignStaff(
    organizationId: number,
    userId: number,
    actor: AccessTokenPayload,
  ) {
    // Only the organization owner (or an Admin) may manage its staff.
    const organization = await this.organizationService.assertCanManage(
      organizationId,
      actor,
    );

    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Reuse the roles mechanism: ensure a "Staff" role exists and grant it.
    const staffRole = await this.rolesService.getOrCreateRole(
      STAFF_ROLE_VALUE,
      'Master / staff member who provides services',
    );
    await user.$add('roles', staffRole.id);

    await this.organizationStaffRepository.findOrCreate({
      where: { organizationId, userId },
      defaults: { organizationId, userId },
    });

    return organization.$get('staff');
  }

  async removeStaff(
    organizationId: number,
    userId: number,
    actor: AccessTokenPayload,
  ) {
    await this.organizationService.assertCanManage(organizationId, actor);
    const removed = await this.organizationStaffRepository.destroy({
      where: { organizationId, userId },
    });
    if (removed === 0) {
      throw new NotFoundException(
        `User ${userId} is not staff of organization ${organizationId}`,
      );
    }
    return { organizationId, userId, removed: true };
  }

  async getOrganizationStaff(organizationId: number) {
    const organization =
      await this.organizationRepository.findByPk(organizationId);
    if (!organization) {
      throw new NotFoundException(
        `Organization with id ${organizationId} not found`,
      );
    }
    return organization.$get('staff');
  }

  async setStaffServices(
    userId: number,
    dto: SetStaffServicesDto,
    actor: AccessTokenPayload,
  ) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // The master must belong to an organization; only that org's owner (or an
    // Admin) may change which services the master provides.
    const membership = await this.organizationStaffRepository.findOne({
      where: { userId },
    });
    if (!membership) {
      throw new BadRequestException(
        `User ${userId} is not assigned as staff to any organization`,
      );
    }
    await this.organizationService.assertCanManage(
      membership.organizationId,
      actor,
    );

    if (dto.serviceIds.length > 0) {
      const services = await this.serviceRepository.findAll({
        where: { id: dto.serviceIds },
      });
      if (services.length !== dto.serviceIds.length) {
        throw new BadRequestException('One or more serviceIds do not exist');
      }
    }

    // Replace the full set of services this master can perform.
    await user.$set('providedServices', dto.serviceIds);
    return user.$get('providedServices');
  }

  async setSchedule(
    userId: number,
    dto: SetScheduleDto,
    actor: AccessTokenPayload,
  ) {
    const user = await this.userRepository.findByPk(userId);
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // A master must belong to an organization before having working hours there.
    const membership = await this.organizationStaffRepository.findOne({
      where: { userId },
    });
    if (!membership) {
      throw new BadRequestException(
        `User ${userId} is not assigned as staff to any organization`,
      );
    }

    // Only that organization's owner (or an Admin) may set the master's schedule.
    await this.organizationService.assertCanManage(
      membership.organizationId,
      actor,
    );

    // Validate one row per (master, dayOfWeek) and that endTime is after startTime.
    const seenDays = new Set<number>();
    for (const entry of dto.entries) {
      if (seenDays.has(entry.dayOfWeek)) {
        throw new BadRequestException(
          `Duplicate schedule entry for dayOfWeek ${entry.dayOfWeek}`,
        );
      }
      seenDays.add(entry.dayOfWeek);
      if (entry.endTime <= entry.startTime) {
        throw new BadRequestException(
          `endTime (${entry.endTime}) must be after startTime (${entry.startTime})`,
        );
      }
    }

    // Replace the master's entire weekly schedule.
    await this.scheduleRepository.destroy({ where: { userId } });
    await this.scheduleRepository.bulkCreate(
      dto.entries.map((entry) => ({
        userId,
        organizationId: membership.organizationId,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
      })),
    );

    return this.getSchedule(userId);
  }

  async getSchedule(userId: number) {
    return this.scheduleRepository.findAll({
      where: { userId },
      order: [['dayOfWeek', 'ASC']],
    });
  }
}
