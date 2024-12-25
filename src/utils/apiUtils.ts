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