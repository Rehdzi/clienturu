import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token received at login or registration',
  })
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
