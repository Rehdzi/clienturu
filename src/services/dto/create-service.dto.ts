import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the organization offering this service',
  })
  @IsInt()
  readonly organizationId: number;

  @ApiProperty({ example: 'Haircut', description: 'Service name' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'Classic men haircut',
    description: 'Service description',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    example: 25.5,
    description: 'Service price (must be greater than 0)',
  })
  @IsNumber()
  @IsPositive()
  readonly price: number;

  @ApiProperty({
    example: 30,
    description: 'Service duration in minutes (positive integer)',
  })
  @IsInt()
  @IsPositive()
  readonly durationMinutes: number;
}
