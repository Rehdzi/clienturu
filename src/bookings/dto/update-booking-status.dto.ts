import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import type { BookingStatus } from '../booking.model';

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'confirmed',
    description: 'Target status for the booking',
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
  })
  @IsIn(['pending', 'confirmed', 'completed', 'cancelled'])
  readonly status: BookingStatus;
}
