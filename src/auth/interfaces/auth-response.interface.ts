export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}
