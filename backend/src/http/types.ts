export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  code?: string;
  requestId?: string;
}
