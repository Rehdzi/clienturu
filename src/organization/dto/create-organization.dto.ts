import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/addresses/dto/create-address.dto';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'John Doe corp.', description: 'Organization name' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'john.doe@company.com',
    description: 'Organization email',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly email?: string;

  @ApiProperty({ example: '+1234567890', description: 'Organization phone' })
  @IsString()
  readonly phone: string;

  @ApiProperty({
    type: [CreateAddressDto],
    required: false,
    description:
      'Optional initial addresses created together with the organization in a single transaction',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAddressDto)
  readonly addresses?: CreateAddressDto[];
}
