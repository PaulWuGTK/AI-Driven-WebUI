import { AuthService } from './auth';

const auth = AuthService.getInstance();

type Headers = Record<string, string>;

export async function callApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Headers)
  };

  const sessionId = auth.getSessionId();
  if (sessionId) {
    headers.Authorization = `bearer ${sessionId}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      // Authentication error - redirect to login
      auth.clearSession();
      window.location.href = '/login';
      throw new Error(`Authentication error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (err) {
    // Check if error message contains 401 or 403
    if (err instanceof Error && (err.message.includes('401') || err.message.includes('403'))) {
      auth.clearSession();
      window.location.href = '/login';
    }
    throw err;
  }
}