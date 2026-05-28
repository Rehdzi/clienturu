import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CreateUserDto } from 'src/users/users/dto/create-user.dto';
import { User } from 'src/users/users/users.model';
import { AuthService } from './auth.service';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with phone and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Access and refresh tokens' })
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request & { user: User }): Promise<AuthResponse> {
    return this.authService.login(req.user);
  }

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'Access and refresh tokens' })
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('register')
  registration(@Body() userDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.registration(userDto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthTokensDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate current access token' })
  @UseGuards(JwtAuthGuard)
  @Post('me')
  me(
    @Req()
    req: Request & { user: { sub: number; phone: string; roles: string[] } },
  ) {
    return req.user;
  }
}
