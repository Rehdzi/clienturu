import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots.query.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // List free slot start times for a master/service on a given date.
  // GET /bookings/available?masterId=&serviceId=&date=YYYY-MM-DD
  @Get('available')
  async getAvailableSlots(@Query() query: AvailableSlotsQueryDto) {
    return this.bookingsService.getAvailableSlots(
      query.masterId,
      query.serviceId,
      query.date,
    );
  }

  // Create a booking for a slot. The slot is re-validated server-side.
  @Post()
  async createBooking(@Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(dto);
  }

  // List bookings for a client or a master, e.g. GET /bookings?clientId=1 or ?masterId=1
  @Get()
  async getBookings(
    @Query('clientId') clientId?: number,
    @Query('masterId') masterId?: number,
  ) {
    if (clientId !== undefined) {
      return this.bookingsService.getBookingsByClient(clientId);
    }
    if (masterId !== undefined) {
      return this.bookingsService.getBookingsByMaster(masterId);
    }
    return [];
  }

  @Get(':id')
  async getBookingById(@Param('id') id: number) {
    return this.bookingsService.getBookingById(id);
  }

  // Transition a booking's status, enforcing the lifecycle.
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto.status);
  }
}
