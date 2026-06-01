import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service } from 'src/services/service.model';
import { Schedule } from 'src/staff/schedule.model';
import { StaffService as StaffServiceModel } from 'src/staff/staff-service.model';
import { Organization } from 'src/organization/organization.model';
import { OrganizationModule } from 'src/organization/organization.module';
import {
  BookingsController,
  OrganizationBookingsController,
} from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';

@Module({
  controllers: [BookingsController, OrganizationBookingsController],
  providers: [BookingsService],
  imports: [
    SequelizeModule.forFeature([
      Booking,
      Service,
      Schedule,
      StaffServiceModel,
      Organization,
    ]),
    // Pulled in so BookingsService can call OrganizationService.assertCanManage.
    OrganizationModule,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
