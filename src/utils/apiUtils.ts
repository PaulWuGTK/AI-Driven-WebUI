export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type ApiPayload = Record<string, unknown>;

export function extractNokMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;

  const queue: unknown[] = [payload];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || typeof current !== 'object') continue;

    const record = current as ApiPayload;
    if ('NOK' in record && record.NOK != null) {
      return String(record.NOK);
    }

    Object.values(record).forEach((value) => {
      if (value && typeof value === 'object') {
        queue.push(value);
      }
    });
  }

  return null;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      'API request failed',
      response.status,
      response.statusText
    );
  }
  
  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('Invalid JSON response');
  }
}