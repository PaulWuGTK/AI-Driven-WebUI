export interface LoginResponse {
  absoluteTimeout: number;
  loginAttempts: number;
  idleTimeout: number;
  sessionID: string;
}

export interface LoginVerifyResponse {
  Login: {
    status: 'ok' | 'captcha_invalid' | 'captcha_expired' | 'locked' | 'failed';
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
