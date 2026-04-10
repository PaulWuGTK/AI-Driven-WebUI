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

  async login(
    username: string,
    password: string,
    captchaId: string,
    captcha: string
  ): Promise<{ success: boolean; needsWizard: boolean | null }> {
    if (this.isDevelopment) {
      const mockData = loginMockData;
      this.setSessionId(mockData.sessionID);
      this.setIdleTimeoutSeconds(mockData.idleTimeout);
      localStorage.setItem('username', username);

      // Import wizard mock data to get OpMode for testing
      const { wizardMockData } = await import('./mockData/authMockData');
      const opMode = wizardMockData.WizardRouter.OpMode;
      const wizardRequired = opMode === 'Init' ? 1 : 0;

      // Simulate backend login response with opMode validation
      const opModeFromLogin = opMode;
      const wizardFromLoginRaw = wizardRequired;
      let needsWizardFromLogin: boolean | null = null;

      const isOpModeValid = opModeFromLogin !== null &&
                            opModeFromLogin !== undefined &&
                            opModeFromLogin !== '';

      console.log('[Auth] Development mode - simulated login response:', {
        wizardRequired: wizardFromLoginRaw,
        opMode: opModeFromLogin,
        isOpModeValid,
        willRetry: !isOpModeValid
      });

      if (isOpModeValid) {
        if (typeof wizardFromLoginRaw === 'boolean') {
          needsWizardFromLogin = wizardFromLoginRaw;
        } else if (wizardFromLoginRaw === 1 || wizardFromLoginRaw === 0) {
          needsWizardFromLogin = wizardFromLoginRaw === 1;
        }

        if (needsWizardFromLogin) {
          localStorage.setItem('wizardRequired', 'true');
        } else {
          localStorage.removeItem('wizardRequired');
        }
      } else {
        // OpMode not valid - will trigger retry mechanism
        localStorage.removeItem('wizardRequired');
      }

      return { success: true, needsWizard: needsWizardFromLogin };
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

    // A-2) create session (must be browser to receive Set-Cookie)
    const wizardFromLoginRaw = verify.Login.wizardRequired;
    const opModeFromLogin = verify.Login.opMode;
    let needsWizardFromLogin: boolean | null = null;

    // Only trust wizardRequired if OpMode is valid (not empty/null/undefined)
    // This ensures we retry when backend hasn't initialized OpMode yet
    const isOpModeValid = opModeFromLogin !== null &&
                          opModeFromLogin !== undefined &&
                          opModeFromLogin !== '';

    console.log('[Auth] Login response:', {
      wizardRequired: wizardFromLoginRaw,
      opMode: opModeFromLogin,
      isOpModeValid,
      willRetry: !isOpModeValid
    });

    if (isOpModeValid) {
      if (typeof wizardFromLoginRaw === 'boolean') {
        needsWizardFromLogin = wizardFromLoginRaw;
      } else if (wizardFromLoginRaw === 1 || wizardFromLoginRaw === 0) {
        needsWizardFromLogin = wizardFromLoginRaw === 1;
      }
    }
    // If OpMode is invalid, needsWizardFromLogin remains null,
    // triggering the retry mechanism in Login.vue

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
    if (needsWizardFromLogin === true) {
      localStorage.setItem('wizardRequired', 'true');
    } else {
      localStorage.removeItem('wizardRequired');
    }
    return { success: true, needsWizard: needsWizardFromLogin };
  }

  private async resolveWizardRequirementOnce(): Promise<boolean> {
    const wizardData = await wizardApi.getWizardInfo() as unknown;
    const nokMessage = extractNokMessage(wizardData);

    if (nokMessage) {
      throw new Error(nokMessage);
    }

    if (!wizardData || typeof wizardData !== 'object' || !('OpMode' in wizardData)) {
      throw new Error('OpMode not ready: Invalid WizardRouter response');
    }

    const opMode = (wizardData as { OpMode?: string }).OpMode;
    if (!opMode) {
      throw new Error('OpMode not ready: Waiting for system initialization');
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
        lastError = err instanceof Error ? err : new Error('Failed to resolve operation mode status');
        console.warn(`Failed to check operation mode status (attempt ${attempt}/${maxAttempts}):`, lastError);

        if (attempt >= maxAttempts) {
          break;
        }

        options?.onRetry?.(attempt, lastError);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }

    const finalError = new Error(
      `Operation mode check failed: ${lastError?.message || 'Unknown error'}`
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

