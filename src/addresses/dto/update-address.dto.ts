import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly city?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly street?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly label?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  readonly isPrimary?: boolean;
}
