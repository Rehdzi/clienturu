import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// "HH:mm" 24-hour clock, e.g. "09:00", "18:30".
const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class ScheduleEntryDto {
  @ApiProperty({
    example: 1,
    description: 'Day of week, 0 (Sunday) to 6 (Saturday)',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  readonly dayOfWeek: number;

  @ApiProperty({
    example: '09:00',
    description: 'Start of working hours, "HH:mm"',
  })
  @Matches(TIME_REGEX, { message: 'startTime must be in "HH:mm" format' })
  readonly startTime: string;

  @ApiProperty({
    example: '18:00',
    description: 'End of working hours, "HH:mm"',
  })
  @Matches(TIME_REGEX, { message: 'endTime must be in "HH:mm" format' })
  readonly endTime: string;
}

export class SetScheduleDto {
  @ApiProperty({
    description:
      "Full weekly working hours (replaces the master's existing schedule)",
    type: [ScheduleEntryDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ScheduleEntryDto)
  readonly entries: ScheduleEntryDto[];
}
