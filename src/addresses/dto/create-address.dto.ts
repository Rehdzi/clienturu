import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: 'Москва', description: 'City' })
  @IsString()
  readonly city: string;

  @ApiProperty({
    example: 'ул. Тверская, д. 1',
    description: 'Street, building (optional suite) as a single line',
  })
  @IsString()
  readonly street: string;

  @ApiProperty({
    example: 'Центральный филиал',
    description: 'Optional branch label',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly label?: string;

  @ApiProperty({ example: 55.7558, required: false })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ example: 37.6173, required: false })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @ApiProperty({ example: false, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  readonly isPrimary?: boolean;
}
