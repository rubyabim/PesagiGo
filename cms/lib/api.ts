export type ApiHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export type ApiHealthResult = {
  ok: boolean;
  data?: ApiHealth;
  message?: string;
};

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:3001';
}

export async function fetchApiHealth(
  apiBaseUrl: string,
): Promise<ApiHealthResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/api/health`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `API returned ${response.status}`,
      };
    }

    const data = (await response.json()) as ApiHealth;
    return { ok: true, data };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown connection error';
    return { ok: false, message };
  }
}
