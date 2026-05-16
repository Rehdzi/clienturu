export type TokenType = 'access' | 'refresh';

export interface JwtPayload {
  sub: number;
  phone: string;
  roles: string[];
  type: TokenType;
}

export interface AccessTokenPayload extends JwtPayload {
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: number;
  type: 'refresh';
}
