import "server-only";

const MOCK_API_BASE_URL = process.env.MOCK_API_BASE_URL ?? "http://127.0.0.1:3001";

export async function fetchMockApi<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${MOCK_API_BASE_URL}${path}`, {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Mock API request failed for ${path}`);
  }

  return (await response.json()) as T;
}
