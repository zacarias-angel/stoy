const API_URL = import.meta.env.VITE_API_URL ?? '';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorBody {
  error?: { code?: string; message?: string; details?: unknown };
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? ((await response.json()) as unknown) : null;

  if (!response.ok) {
    const parsed = (body ?? {}) as ApiErrorBody;
    throw new ApiError(
      response.status,
      parsed.error?.message ?? 'Ocurrio un error inesperado',
      parsed.error?.details
    );
  }

  return body as T;
}
