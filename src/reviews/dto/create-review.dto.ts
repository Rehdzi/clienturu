import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ example: 1, description: 'ID of the organization being reviewed' })
  @IsInt()
  readonly organizationId: number;

  @ApiProperty({ example: 1, description: 'ID of the client (User) leaving the review' })
  @IsInt()
  readonly clientId: number;

  @ApiProperty({ example: 1, description: 'ID of the booking this review came from', required: false })
  @IsOptional()
  @IsInt()
  readonly bookingId?: number;

  @ApiProperty({ example: 5, description: 'Rating from 1 to 5' })
  @IsInt()
  @Min(1)
  @Max(5)
  readonly rating: number;

  @ApiProperty({ example: 'Great service!', description: 'Optional free-text comment', required: false })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
