import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from 'src/users/users/dto/create-user.dto';
import { User } from 'src/users/users/users.model';
import { UsersService } from 'src/users/users/users.service';
import { AuthResponse } from './interfaces/auth-response.interface';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  private readonly bcryptRounds: number;
  private readonly refreshSecret: string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.bcryptRounds = Number(
      this.configService.get('BCRYPT_ROUNDS', 12),
    );
    this.refreshSecret =
      this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    this.refreshExpiresIn = this.configService.get(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
  }

  async login(user: User): Promise<AuthResponse> {
    return this.issueAuthResponse(user);
  }

  async validateUser(phone: string, password: string): Promise<User> {
    const user = await this.userService.getUserByPhone(phone);
    const passwordHash = user?.get('password');

    if (!user || !passwordHash) {
      throw new UnauthorizedException({ message: 'Incorrect credentials' });
    }

    const passwordMatches = await bcrypt.compare(password, passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException({ message: 'Incorrect credentials' });
    }

    return user;
  }

  async registration(userDto: CreateUserDto): Promise<AuthResponse> {
    const existing = await this.userService.getUserByPhone(userDto.phone);

    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await bcrypt.hash(userDto.password, this.bcryptRounds);
    const user = await this.userService.createUser({
      ...userDto,
      password: hashPassword,
    });

    return this.issueAuthResponse(user);
  }

  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload: RefreshTokenPayload;

    try {
      payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    const user = await this.userService.getUserById(payload.sub);

    if (!user) {
      throw new UnauthorizedException({ message: 'Invalid refresh token' });
    }

    return this.issueAuthResponse(user);
  }

  private async issueAuthResponse(user: User): Promise<AuthResponse> {
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  private async generateTokens(user: User) {
    const roles = this.extractRoleValues(user);
    const accessPayload: AccessTokenPayload = {
      sub: user.id,
      phone: user.phone,
      roles,
      type: 'access',
    };
    const refreshPayload: RefreshTokenPayload = {
      sub: user.id,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn as `${number}d`,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private extractRoleValues(user: User): string[] {
    return user.roles?.map((role) => role.value) ?? [];
  }

  private sanitizeUser(user: User): Record<string, unknown> {
    const { password: _password, ...safeUser } = user.get({
      plain: true,
    }) as unknown as Record<string, unknown> & { password?: string };
    return safeUser;
  }
}
