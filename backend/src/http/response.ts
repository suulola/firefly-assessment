import type { Response } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
}

export function successResponse<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  } satisfies ApiResponse<T>);
}

export function errorResponse(res: Response, statusCode: number, message: string) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
  } satisfies ApiResponse<never>);
}

export function catchErrorResponse(
  res: Response,
  message: string,
  statusCode = 502,
) {
  return errorResponse(res, statusCode, message);
}
