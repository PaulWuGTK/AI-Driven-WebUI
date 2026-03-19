import type { LoginResponse,LoginVerifyResponse } from '../types/auth';
import { loginMockData } from './mockData/authMockData';
import { wizardApi } from './api/wizard';
import { callApi } from './apiClient';
import { extractNokMessage } from '../utils/apiUtils';

const DEFAULT_WIZARD_RETRY_DELAY_MS = 3000;
const DEFAULT_WIZARD_MAX_ATTEMPTS = 20;

export class AuthService {
  private static instance: AuthService;
  private sessionId: string | null = null;
  private idleTimeoutSeconds: number | null = null;
  private isDevelopment = import.meta.env.DEV;
  private static readonly IDLE_TIMEOUT_STORAGE_KEY = 'sessionIdleTimeout';

  private constructor() {
    // Try to restore session from localStorage
    this.sessionId = localStorage.getItem('sessionId');
    const storedIdleTimeout = Number(localStorage.getItem(AuthService.IDLE_TIMEOUT_STORAGE_KEY));
    this.idleTimeoutSeconds = Number.isFinite(storedIdleTimeout) && storedIdleTimeout > 0
      ? storedIdleTimeout
      : null;
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

  setIdleTimeoutSeconds(timeoutSeconds: number | null) {
    if (typeof timeoutSeconds === 'number' && Number.isFinite(timeoutSeconds) && timeoutSeconds > 0) {
      this.idleTimeoutSeconds = timeoutSeconds;
      localStorage.setItem(AuthService.IDLE_TIMEOUT_STORAGE_KEY, String(timeoutSeconds));
      return;
    }

    this.idleTimeoutSeconds = null;
    localStorage.removeItem(AuthService.IDLE_TIMEOUT_STORAGE_KEY);
  }

  getSessionId(): string | null {
    return this.sessionId;
  }

  getIdleTimeoutSeconds(): number | null {
    return this.idleTimeoutSeconds;
  }

  clearSession() {
    this.sessionId = null;
    this.idleTimeoutSeconds = null;
    localStorage.removeItem('sessionId');
    localStorage.removeItem(AuthService.IDLE_TIMEOUT_STORAGE_KEY);
    localStorage.removeItem('username');
    localStorage.removeItem('wizardRequired');
    localStorage.removeItem('userRole');
    localStorage.removeItem('sidebarAccessContext');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth:session-cleared'));
    }
  }

  isAuthenticated(): boolean {
    return !!this.sessionId;
  }

  async login(username: string, password: string, captchaId: string, captcha: string): Promise<boolean> {
    if (this.isDevelopment) {
      const mockData = loginMockData;
      this.setSessionId(mockData.sessionID);
      this.setIdleTimeoutSeconds(mockData.idleTimeout);
      localStorage.setItem('username', username);
      localStorage.removeItem('wizardRequired');
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
      const loginResponse = verify?.Login;

      if (loginResponse?.status === 'locked') {
        const error: any = new Error('Account locked');
        error.status = 'locked';
        error.retryAfter = loginResponse.retryAfter || 0;
        error.lockUntil = loginResponse.lockUntil || 0;
        throw error;
      }

      if (loginResponse?.status === 'captcha_invalid') {
        const error: any = new Error('Invalid captcha');
        error.status = 'captcha_invalid';
        error.failCount = loginResponse.failCount || 0;
        throw error;
      }

      const error: any = new Error(loginResponse?.error || 'Captcha verification failed');
      error.status = loginResponse?.status || 'failed';
      throw error;
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
    this.setIdleTimeoutSeconds(sessionData.idleTimeout);
    localStorage.setItem('username', username);
    localStorage.removeItem('wizardRequired');
    return true;
  }

  private async resolveWizardRequirementOnce(): Promise<boolean> {
    const wizardData = await wizardApi.getWizardInfo() as unknown;
    const nokMessage = extractNokMessage(wizardData);

    if (nokMessage) {
      throw new Error(nokMessage);
    }

    if (!wizardData || typeof wizardData !== 'object' || !('OpMode' in wizardData)) {
      throw new Error('Invalid WizardRouter response');
    }

    const opMode = (wizardData as { OpMode?: string }).OpMode;
    if (!opMode) {
      throw new Error('Missing WizardRouter OpMode');
    }

    const needsWizard = opMode === 'Init';
    if (needsWizard) {
      localStorage.setItem('wizardRequired', 'true');
    } else {
      localStorage.removeItem('wizardRequired');
    }

    return needsWizard;
  }

  async resolveWizardRequirementWithRetry(options?: {
    maxAttempts?: number;
    retryDelayMs?: number;
    onRetry?: (attempt: number, error: Error) => void;
  }): Promise<boolean> {
    const maxAttempts = options?.maxAttempts ?? DEFAULT_WIZARD_MAX_ATTEMPTS;
    const retryDelayMs = options?.retryDelayMs ?? DEFAULT_WIZARD_RETRY_DELAY_MS;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.resolveWizardRequirementOnce();
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Failed to resolve wizard status');
        console.warn(`Failed to check wizard status (attempt ${attempt}/${maxAttempts}):`, lastError);

        if (attempt >= maxAttempts) {
          break;
        }

        options?.onRetry?.(attempt, lastError);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    const finalError = new Error(
      `Wizard status check failed: ${lastError?.message || 'Unknown error'}`
    );
    throw finalError;
  }

  needsWizard(): boolean {
    return localStorage.getItem('wizardRequired') === 'true';
  }

  clearWizardFlag() {
    localStorage.removeItem('wizardRequired');
  }
}
