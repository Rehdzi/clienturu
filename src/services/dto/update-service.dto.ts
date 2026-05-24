import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ example: 'Haircut', description: 'Service name', required: false })
  @IsOptional()
  @IsString()
  readonly name?: string;

  @ApiProperty({ example: 'Classic men haircut', description: 'Service description', required: false })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({ example: 25.5, description: 'Service price (must be greater than 0)', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readonly price?: number;

  @ApiProperty({ example: 30, description: 'Service duration in minutes (positive integer)', required: false })
  @IsOptional()
  @IsInt()
  @IsPositive()
  readonly durationMinutes?: number;

  @ApiProperty({ example: true, description: 'Whether the service is currently offered', required: false })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
