import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { OrganizationStaff } from './organization-staff.model';
import { StaffService as StaffServiceModel } from './staff-service.model';
import { Schedule } from './schedule.model';
import { User } from 'src/users/users/users.model';
import { Organization } from 'src/organization/organization.model';
import { Service } from 'src/services/service.model';
import { RolesModule } from 'src/roles/roles.module';
import { OrganizationModule } from 'src/organization/organization.module';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [
    SequelizeModule.forFeature([
      OrganizationStaff,
      StaffServiceModel,
      Schedule,
      User,
      Organization,
      Service,
    ]),
    RolesModule,
    OrganizationModule,
  ],
  exports: [StaffService],
})
export class StaffModule {}
