export interface LoginResponse {
  absoluteTimeout: number;
  loginAttempts: number;
  idleTimeout: number;
  sessionID: string;
}