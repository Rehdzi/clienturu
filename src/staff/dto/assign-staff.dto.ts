import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class AssignStaffDto {
  @ApiProperty({
    example: 1,
    description: 'ID of the user to assign as a master/staff member',
  })
  @IsInt()
  @IsPositive()
  readonly userId: number;
}
