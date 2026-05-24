import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationModule } from 'src/organization/organization.module';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service } from './service.model';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [SequelizeModule.forFeature([Service]), OrganizationModule],
  exports: [ServicesService],
})
export class ServicesModule {}
