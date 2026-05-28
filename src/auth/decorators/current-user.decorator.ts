import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessTokenPayload } from '../interfaces/jwt-payload.interface';

// Extracts the authenticated user (the validated JWT payload) that JwtStrategy
// attached to the request. Use together with JwtAuthGuard so `user` is present.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload =>
    ctx.switchToHttp().getRequest<{ user: AccessTokenPayload }>().user,
);
