import type { LoginResponse } from '../types/auth';
import { loginMockData } from './mockData/authMockData';

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

  async login(username: string, password: string): Promise<boolean> {
    try {
      // Use mock data in development
      if (this.isDevelopment) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate authentication check
        if (username === 'admin' && password === 'admin') {
          this.setSessionId(loginMockData.sessionID);
          localStorage.setItem('username', username);
          return true;
        }
        throw new Error('Invalid username or password');
      }

      // Production API call
      const response = await fetch('/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json() as LoginResponse;
      
      if (data.sessionID) {
        this.setSessionId(data.sessionID);
        localStorage.setItem('username', username);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
}