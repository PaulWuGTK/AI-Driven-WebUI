import { AuthService } from './auth';
import { Router } from 'vue-router';

export class AutoLogoutService {
  private static instance: AutoLogoutService;
  private logoutTimer: number | null = null;
  private readonly DEFAULT_INACTIVITY_TIMEOUT_MS = 3 * 60 * 1000;
  private router: Router | null = null;
  private isEnabled = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): AutoLogoutService {
    if (!AutoLogoutService.instance) {
      AutoLogoutService.instance = new AutoLogoutService();
    }
    return AutoLogoutService.instance;
  }

  /**
   * Initialize auto logout service with router instance
   */
  init(router: Router) {
    this.router = router;
  }

  /**
   * Start monitoring user activity
   */
  start() {
    if (!this.isEnabled) {
      this.isEnabled = true;
      this.setupEventListeners();
    }

    this.resetTimer();
  }

  /**
   * Stop monitoring user activity
   */
  stop() {
    this.isEnabled = false;
    this.clearTimer();
    this.removeEventListeners();
  }

  /**
   * Reset the inactivity timer
   */
  private resetTimer() {
    this.clearTimer();

    if (!this.isEnabled) {
      return;
    }

    this.logoutTimer = window.setTimeout(() => {
      this.performLogout();
    }, this.getInactivityTimeoutMs());
  }

  private getInactivityTimeoutMs(): number {
    const idleTimeoutSeconds = AuthService.getInstance().getIdleTimeoutSeconds();
    if (typeof idleTimeoutSeconds === 'number' && Number.isFinite(idleTimeoutSeconds) && idleTimeoutSeconds > 0) {
      return idleTimeoutSeconds * 1000;
    }
    return this.DEFAULT_INACTIVITY_TIMEOUT_MS;
  }

  /**
   * Clear the current timer
   */
  private clearTimer() {
    if (this.logoutTimer !== null) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  /**
   * Perform logout and redirect to login page
   */
  private async performLogout() {
    const auth = AuthService.getInstance();
    auth.clearSession();

    if (this.router) {
      try {
        await this.router.push({
          path: '/login',
          query: { reason: 'timeout' }
        });
      } catch (error) {
        console.error('Error redirecting to login:', error);
      }
    }

    this.stop();
  }

  /**
   * Setup event listeners for user activity
   */
  private setupEventListeners() {
    // Mouse and keyboard events
    document.addEventListener('mousemove', this.handleUserActivity);
    document.addEventListener('mousedown', this.handleUserActivity);
    document.addEventListener('keypress', this.handleUserActivity);
    document.addEventListener('keydown', this.handleUserActivity);
    document.addEventListener('scroll', this.handleUserActivity, true);
    document.addEventListener('touchstart', this.handleUserActivity);
    document.addEventListener('click', this.handleUserActivity);
  }

  /**
   * Remove event listeners
   */
  private removeEventListeners() {
    document.removeEventListener('mousemove', this.handleUserActivity);
    document.removeEventListener('mousedown', this.handleUserActivity);
    document.removeEventListener('keypress', this.handleUserActivity);
    document.removeEventListener('keydown', this.handleUserActivity);
    document.removeEventListener('scroll', this.handleUserActivity, true);
    document.removeEventListener('touchstart', this.handleUserActivity);
    document.removeEventListener('click', this.handleUserActivity);
  }

  /**
   * Handle user activity - reset timer
   */
  private handleUserActivity = () => {
    if (this.isEnabled) {
      this.resetTimer();
    }
  };
}
