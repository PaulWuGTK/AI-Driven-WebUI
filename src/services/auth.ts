import type { LoginResponse,LoginVerifyResponse } from '../types/auth';
import { loginMockData } from './mockData/authMockData';
import { wizardApi } from './api/wizard';
import { callApi } from './apiClient';



export class AuthService {
  private static instance: AuthService;
  private sessionId: string | null = null;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {
    // Try to restore session from localStorage
    this.sessionId = localStorage.getItem('sessionId');
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  setSessionId(sessionId: string) {
    this.sessionId = sessionId;
    localStorage.setItem('sessionId', sessionId);
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
  }

  isAuthenticated(): boolean {
    return !!this.sessionId;
  }

  async login(username: string, password: string, captchaId: string, captcha: string): Promise<boolean> {
    if (this.isDevelopment) {
      const mockData = loginMockData;
      this.setSessionId(mockData.sessionID);
      localStorage.setItem('username', username);
      return true;
    }

    // A-1) verify captcha (Lua)
    const verifyBody = { Login: { username, captchaId, captcha } };
    const verify = await callApi<LoginVerifyResponse>(
      '/API/info?list=Login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verifyBody)
      }
    );

    if (!verify?.Login || verify.Login.status !== 'ok') {
      const msg =
        verify?.Login?.status === 'locked'
          ? `Too many attempts. Retry after ${verify.Login.retryAfter ?? 60}s.`
          : (verify?.Login?.error || 'Captcha verification failed.');
      throw new Error(msg);
    }

    // A-2) create session (must be browser → to receive Set-Cookie)
    const sessionResp = await fetch('/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const sessionText = await sessionResp.text();
    if (!sessionResp.ok) {
      throw new Error(`Session login failed: ${sessionResp.status} ${sessionText}`);
    }

    const sessionData = JSON.parse(sessionText) as LoginResponse;

    if (!sessionData?.sessionID) {
      throw new Error('Session login failed: missing sessionID');
    }

    this.setSessionId(sessionData.sessionID);
    localStorage.setItem('username', username);
    return true;
  }

  needsWizard(): boolean {
    return localStorage.getItem('wizardRequired') === 'true';
  }

  clearWizardFlag() {
    localStorage.removeItem('wizardRequired');
  }
}