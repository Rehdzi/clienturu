import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Address } from 'src/addresses/address.model';
import { Organization } from 'src/organization/organization.model';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles-model';
import { OwnerApplication } from './owner-application.model';
import { OwnerApplicationsController } from './owner-applications.controller';
import { OwnerApplicationsService } from './owner-applications.service';

@Module({
  controllers: [OwnerApplicationsController],
  providers: [OwnerApplicationsService],
  imports: [
    SequelizeModule.forFeature([
      OwnerApplication,
      Organization,
      Address,
      Role,
      UserRoles,
    ]),
  ],
})
export class OwnerApplicationsModule {}
