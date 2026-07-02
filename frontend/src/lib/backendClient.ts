// Empty string in dev: requests go to a relative path, same-origin as the
// Vite dev server, which proxies them to the backend (see vite.config.ts).
// Set VITE_BACKEND_URL to the deployed backend URL for production builds.
export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? "";

export interface BackendHealth {
  status: string;
}

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${BACKEND_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed: ${response.status}`);
  }
  return (await response.json()) as BackendHealth;
}
