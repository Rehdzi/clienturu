import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsInt, IsPositive } from 'class-validator';

export class SetStaffServicesDto {
  @ApiProperty({
    example: [1, 2, 3],
    description:
      'Full set of service IDs this master can perform (replaces existing set)',
    type: [Number],
  })
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  readonly serviceIds: number[];
}
