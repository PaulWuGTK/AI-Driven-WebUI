import { AuthService } from './auth';

const auth = AuthService.getInstance();

type Headers = Record<string, string>;

export async function callApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Headers)
  };


  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}