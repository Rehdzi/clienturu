import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: '9001234567',
    description: 'Phone number without region code',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{10,15}$/, { message: 'Phone must contain 10–15 digits' })
  readonly phone: string;

  @ApiProperty({ example: 'Str0ngP@ss!', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  readonly password: string;
}
