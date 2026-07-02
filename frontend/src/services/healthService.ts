import { BACKEND_BASE_URL } from "@/lib/backendClient";
import { readApiResponse } from "@/services/apiResponse";

export interface BackendHealth {
  status: string;
}

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${BACKEND_BASE_URL}/health`);
  return readApiResponse<BackendHealth>(response, "Failed to reach the backend.");
}
