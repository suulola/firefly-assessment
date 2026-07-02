import { Router } from "express";
import { errorResponse, successResponse } from "@/http/response.js";
import { asyncHandler } from "@/http/middleware.js";
import type { FavoritesStore } from "@/modules/favorites/types.js";
import {
  checkLiveness,
  checkPokeApiReachable,
  checkReadiness,
} from "@/modules/health/service.js";

export function healthRouter(store: FavoritesStore): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const liveness = checkLiveness();
    successResponse(res, liveness, "Backend is healthy.");
  });

  router.get("/pokeapi", asyncHandler(async (_req, res) => {
    const result = await checkPokeApiReachable();
    if (result.reachable) {
      const data = { status: "ok", pokeapi: "reachable" };
      successResponse(res, data, "PokéAPI is reachable.");
    } else {
      errorResponse(res, 502, "PokéAPI is unreachable.", {
        code: "POKEAPI_UNAVAILABLE",
        requestId: res.locals.requestId,
      });
    }
  }));

  router.get("/ready", asyncHandler(async (_req, res) => {
    const readiness = await checkReadiness(store);
    if (readiness.status === "ready") {
      successResponse(res, readiness, "Backend is ready.");
      return;
    }
    errorResponse(res, 503, "Backend is not ready.", {
      code: "BACKEND_NOT_READY",
      requestId: res.locals.requestId,
    });
  }));

  return router;
}
