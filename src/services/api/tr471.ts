import type { TR471Response, TR471Config } from '../../types/tr471';
import { AuthService } from '../auth';
import { getTR471MockConfig, runTR471MockTest } from '../mockData/tr471MockData';

const isDevelopment = import.meta.env.DEV;

export const getTR471Config = async (): Promise<TR471Response> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return getTR471MockConfig();
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();

  const response = await fetch('/API/info?list=TR471', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'Authorization': `bearer ${sessionId}` } : {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    auth.clearSession();
    window.location.href = `/login?t=${Date.now()}`;
    throw new Error(`Authentication error: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch TR471 config: ${response.status}`);
  }

  return response.json();
};

export const runTR471Test = async (config: Partial<TR471Config>): Promise<TR471Response> => {
  if (isDevelopment) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return runTR471MockTest(config);
  }

  const auth = AuthService.getInstance();
  const sessionId = auth.getSessionId();

  const response = await fetch('/API/info?list=TR471', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'Authorization': `bearer ${sessionId}` } : {})
    },
    body: JSON.stringify({ TR471: config })
  });

  if (response.status === 401 || response.status === 403) {
    auth.clearSession();
    window.location.href = `/login?t=${Date.now()}`;
    throw new Error(`Authentication error: ${response.status}`);
  }

  if (!response.ok) {
    throw new Error(`TR471 test failed: ${response.status}`);
  }

  return response.json();
};
