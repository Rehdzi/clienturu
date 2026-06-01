import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

// Window-filter for GET /organization/:id/bookings; defaults applied in service.
export class OrganizationBookingsQueryDto {
  @ApiPropertyOptional({
    example: '2026-06-01T00:00:00.000Z',
    description: 'Start of the visible range (inclusive). Defaults to Monday 00:00 UTC of the current week.',
  })
  @IsOptional()
  @IsISO8601()
  readonly from?: string;

  @ApiPropertyOptional({
    example: '2026-06-08T00:00:00.000Z',
    description: 'End of the visible range (exclusive). Defaults to `from` + 7 days.',
  })
  @IsOptional()
  @IsISO8601()
  readonly to?: string;
}
