import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Matches } from 'class-validator';

// "YYYY-MM-DD" calendar date.
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export class AvailableSlotsQueryDto {
  @ApiProperty({ example: 1, description: 'ID of the master (User)' })
  @Type(() => Number)
  @IsInt()
  readonly masterId: number;

  @ApiProperty({ example: 1, description: 'ID of the service' })
  @Type(() => Number)
  @IsInt()
  readonly serviceId: number;

  @ApiProperty({ example: '2026-05-24', description: 'Calendar date to list slots for, "YYYY-MM-DD"' })
  @Matches(DATE_REGEX, { message: 'date must be in "YYYY-MM-DD" format' })
  readonly date: string;
}
