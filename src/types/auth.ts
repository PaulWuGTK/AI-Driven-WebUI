export interface LoginResponse {
  absoluteTimeout: number;
  loginAttempts: number;
  idleTimeout: number;
  sessionID: string;
}

export interface LoginVerifyResponse {
  Login: {
    status: 'ok' | 'captcha_invalid' | 'captcha_expired' | 'credentials_invalid' | 'locked' | 'failed';
    locked?: boolean;
    lockUntil?: number;
    retryAfter?: number;
    failCount?: number;
    error?: string;
    next?: string;
    opMode?: string;
    wizardRequired?: number | boolean;
  };
}
