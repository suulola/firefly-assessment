import { randomUUID } from "node:crypto";
import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from "express";
import { HttpError, isHttpError } from "@/http/errors.js";
import { errorResponse } from "@/http/response.js";
import { logger } from "@/logger.js";

const REQUEST_ID_HEADER = "x-request-id";

export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.header(REQUEST_ID_HEADER);
  const requestId = incoming?.trim() || randomUUID();
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
};

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    logger.info("http_request", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(performance.now() - start),
    });
  });
  next();
};

export const notFoundMiddleware: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, "Route not found.", { code: "NOT_FOUND" }));
};

export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  const statusCode = isHttpError(error) ? error.statusCode : 500;
  const code = isHttpError(error) ? error.code : "INTERNAL_SERVER_ERROR";
  const message = isHttpError(error) ? error.message : "Internal server error.";

  logger.error("http_error", {
    requestId: res.locals.requestId,
    method: req.method,
    path: req.originalUrl,
    status: statusCode,
    code,
    message,
    stack: error instanceof Error ? error.stack : undefined,
  });

  errorResponse(res, statusCode, message, { code, requestId: res.locals.requestId });
};
