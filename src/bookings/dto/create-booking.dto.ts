import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsOptional, IsString } from 'class-validator';

export class CreateBookingDto {
  // The client is derived from the authenticated token, not the request body,
  // so one user cannot create bookings on another user's behalf.

  @ApiProperty({ example: 1, description: 'ID of the service being booked' })
  @IsInt()
  readonly serviceId: number;

  @ApiProperty({
    example: 1,
    description: 'ID of the master (User) who will perform the service',
  })
  @IsInt()
  readonly masterId: number;

  @ApiProperty({
    example: '2026-05-24T09:00:00.000Z',
    description: 'Desired slot start time as an ISO-8601 timestamp (UTC)',
  })
  @IsISO8601()
  readonly startTime: string;

  @ApiProperty({
    example: 'Please use the parking entrance',
    description: 'Optional client comment',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
