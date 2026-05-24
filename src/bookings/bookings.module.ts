import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Service } from 'src/services/service.model';
import { Schedule } from 'src/staff/schedule.model';
import { StaffService as StaffServiceModel } from 'src/staff/staff-service.model';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './booking.model';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [SequelizeModule.forFeature([Booking, Service, Schedule, StaffServiceModel])],
  exports: [BookingsService],
})
export class BookingsModule {}
