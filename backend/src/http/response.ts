import type { Response } from "express";
import type { ApiResponse } from "@/http/types.js";

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

export interface ErrorResponseOptions {
  code?: string;
  requestId?: string;
}

export function errorResponse(
  res: Response,
  statusCode: number,
  message: string,
  options: ErrorResponseOptions = {},
) {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(options.code ? { code: options.code } : {}),
    ...(options.requestId ? { requestId: options.requestId } : {}),
  } satisfies ApiResponse<never>);
}

export function catchErrorResponse(
  res: Response,
  message: string,
  statusCode = 502,
) {
  return errorResponse(res, statusCode, message);
}
