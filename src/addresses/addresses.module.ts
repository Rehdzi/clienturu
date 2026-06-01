import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrganizationModule } from 'src/organization/organization.module';
import { Address } from './address.model';
import { AddressesController } from './addresses.controller';
import { AddressesService } from './addresses.service';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
  imports: [SequelizeModule.forFeature([Address]), OrganizationModule],
  exports: [AddressesService],
})
export class AddressesModule {}
