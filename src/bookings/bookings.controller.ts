import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { AccessTokenPayload } from 'src/auth/interfaces/jwt-payload.interface';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { AvailableSlotsQueryDto } from './dto/available-slots.query.dto';
import { OrganizationBookingsQueryDto } from './dto/organization-bookings.query.dto';

@Controller('organization')
export class OrganizationBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'List bookings for an organization within a date window (owner/admin only)',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'ISO-8601 start of range; defaults to Monday 00:00 UTC of the current week.',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'ISO-8601 end of range; defaults to `from` + 7 days.',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id/bookings')
  async getOrganizationBookings(
    @Param('id', ParseIntPipe) id: number,
    @Query() query: OrganizationBookingsQueryDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingsService.getBookingsByOrganization(id, user, {
      from: query.from,
      to: query.to,
    });
  }
}

@Controller('bookings')
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get('available')
  async getAvailableSlots(@Query() query: AvailableSlotsQueryDto) {
    return this.bookingsService.getAvailableSlots(
      query.masterId,
      query.serviceId,
      query.date,
    );
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createBooking(
    @Body() dto: CreateBookingDto,
    @CurrentUser() user: AccessTokenPayload,
  ) {
    return this.bookingsService.createBooking(dto, user);
  }

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
