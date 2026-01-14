import type { LoginResponse } from '../types/auth';
import { loginMockData } from './mockData/authMockData';
import { wizardApi } from './api/wizard';

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

  async login(username: string, password: string, captchaId?: string, captcha?: string): Promise<boolean> {
    try {
      // Use mock data in development
      if (this.isDevelopment) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simulate authentication check
        if (username === 'admin' && password === 'admin') {
          this.setSessionId(loginMockData.sessionID);
          localStorage.setItem('username', username);

          // Check wizard status from wizard API
          try {
            const wizardData = await wizardApi.getWizardInfo();
            if (wizardData.OpMode === 'Init') {
              localStorage.setItem('wizardRequired', 'true');
            } else {
              localStorage.removeItem('wizardRequired');
            }
          } catch (err) {
            console.warn('Failed to check wizard status:', err);
          }

          return true;
        }
        throw new Error('Invalid username or password');
      }

      // Production API call
      const requestBody: any = { username, password };

      if (captchaId && captcha) {
        requestBody.captchaId = captchaId;
        requestBody.captcha = captcha;
      }

      const response = await fetch('/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json() as LoginResponse;

      if (data.sessionID) {
        this.setSessionId(data.sessionID);
        localStorage.setItem('username', username);

        // Check wizard status from wizard API
        try {
          const wizardData = await wizardApi.getWizardInfo();
          if (wizardData.OpMode === 'Init') {
            localStorage.setItem('wizardRequired', 'true');
          } else {
            localStorage.removeItem('wizardRequired');
          }
        } catch (err) {
          console.warn('Failed to check wizard status:', err);
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  needsWizard(): boolean {
    return localStorage.getItem('wizardRequired') === 'true';
  }

  clearWizardFlag() {
    localStorage.removeItem('wizardRequired');
  }
}