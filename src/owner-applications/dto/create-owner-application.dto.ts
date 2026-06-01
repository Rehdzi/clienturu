import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOwnerApplicationDto {
  @ApiProperty({ example: 'My Salon' })
  @IsString()
  @IsNotEmpty()
  readonly orgName: string;

  @ApiProperty({ example: '+79001234567' })
  @IsString()
  @IsNotEmpty()
  readonly orgPhone: string;

  @ApiProperty({ example: 'info@salon.com', required: false })
  @IsOptional()
  @IsEmail()
  readonly orgEmail?: string;

  @ApiProperty({ example: 'Москва' })
  @IsString()
  @IsNotEmpty()
  readonly addressCity: string;

  @ApiProperty({ example: 'ул. Тверская, 1' })
  @IsString()
  @IsNotEmpty()
  readonly addressStreet: string;

  @ApiProperty({ example: 'Центральный филиал', required: false })
  @IsOptional()
  @IsString()
  readonly addressLabel?: string;

  @ApiProperty({ example: 55.7558, required: false })
  @IsOptional()
  @IsLatitude()
  readonly latitude?: number;

  @ApiProperty({ example: 37.6173, required: false })
  @IsOptional()
  @IsLongitude()
  readonly longitude?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly comment?: string;
}
