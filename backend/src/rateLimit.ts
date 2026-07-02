import rateLimit from "express-rate-limit";
import type { RequestHandler } from "express";
import { errorResponse } from "@/http/response.js";

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function createRateLimitMiddleware(options: RateLimitOptions): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      errorResponse(res, 429, "Too many requests.", {
        code: "RATE_LIMITED",
        requestId: res.locals.requestId,
      });
    },
  });
}
