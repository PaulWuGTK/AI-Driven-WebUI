type Headers = Record<string, string>;

export async function callApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Headers)
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Authentication error: ${response.status}`);
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  } catch (err) {
    // Check if error message contains 401 or 403
    throw err;
  }
}