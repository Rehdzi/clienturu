import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RejectOwnerApplicationDto {
  @ApiProperty({ example: 'Insufficient information' })
  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}
