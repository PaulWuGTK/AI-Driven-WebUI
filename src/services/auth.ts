// This is a simplified auth service that doesn't require login
export class AuthService {
  private static instance: AuthService;
  private isDevelopment = import.meta.env.DEV;

  private constructor() {
    // No initialization needed
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Always return true for authentication
  isAuthenticated(): boolean {
    return true;
  }
  
  // Add missing methods that are referenced in other files
  getSessionId(): string {
    return "dummy-session-id";
  }
  
  clearSession(): void {
    // No-op since we don't have real sessions
  }
}