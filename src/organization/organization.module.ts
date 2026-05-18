import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Organization } from './organization.model';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService],
  imports: [SequelizeModule.forFeature([Organization])],
  exports: [OrganizationService]
})
export class OrganizationModule {}
