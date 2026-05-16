import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Strategy } from 'passport-local';
import { User } from 'src/users/users/users.model';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'phone' });
  }

  async validate(phone: string, password: string): Promise<User> {
    const dto = plainToInstance(LoginDto, { phone, password });
    const errors = await validate(dto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    return this.authService.validateUser(phone, password);
  }
}
