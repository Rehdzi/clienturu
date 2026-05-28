import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots.query.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // List free slot start times for a master/service on a given date. Public:
  // clients browse availability before authenticating to book.
  // GET /bookings/available?masterId=&serviceId=&date=YYYY-MM-DD
  @Get('available')
  async getAvailableSlots(@Query() query: AvailableSlotsQueryDto) {
    return this.bookingsService.getAvailableSlots(
      query.masterId,
      query.serviceId,
      query.date,
    );
  }

  // Create a booking for a slot. The slot is re-validated server-side and the
  // client identity is taken from the token, not the request body.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingsService.createBooking(dto, user);
  }

  // List bookings for a client or a master, e.g. GET /bookings?clientId=1 or ?masterId=1
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async getBookings(
    @CurrentUser() user: AccessTokenPayload,
    @Query('clientId') clientId?: number,
    @Query('masterId') masterId?: number,
  ) {
    if (clientId !== undefined) {
      return this.bookingsService.getBookingsByClient(clientId, user);
    }
    if (masterId !== undefined) {
      return this.bookingsService.getBookingsByMaster(masterId, user);
    }
    return [];
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getBookingById(
    @Param('id') id: number,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingsService.getBookingById(id, user);
  }

  // Transition a booking's status, enforcing the lifecycle.
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingsService.updateStatus(id, dto.status, user);
  }
}
