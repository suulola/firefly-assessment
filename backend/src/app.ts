import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { buildCorsOptions } from "@/corsConfig.js";
import { loadConfig } from "@/config.js";
import {
  errorMiddleware,
  notFoundMiddleware,
  requestIdMiddleware,
  requestLoggerMiddleware,
} from "@/http/middleware.js";
import type { CreateAppOptions } from "@/types.js";
import { healthRouter } from "@/modules/health/route.js";
import { pokemonRouter } from "@/modules/pokemon/route.js";
import { createFavoritesRouter } from "@/modules/favorites/route.js";
import { createFileFavoritesStore } from "@/modules/favorites/repository.js";
import { configurePokeApiRepository } from "@/modules/pokemon/repository.js";
import { openApiDocument } from "@/openapi.js";
import { createRateLimitMiddleware } from "@/rateLimit.js";

export function createApp(options: CreateAppOptions = {}) {
  const config = loadConfig();
  const app = express();
  const favoritesStore = createFileFavoritesStore(
    options.favoritesStorePath ?? config.favoritesStorePath,
  );

  configurePokeApiRepository({
    timeoutMs: options.pokeApiTimeoutMs ?? config.pokeApiTimeoutMs,
    cacheTtlMs: options.pokeApiCacheTtlMs ?? config.pokeApiCacheTtlMs,
  });

  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(helmet());
  app.use(cors(buildCorsOptions(options.corsOrigin ?? config.corsOrigin)));
  app.use(express.json({ limit: "16kb" }));
  app.use(
    createRateLimitMiddleware({
      windowMs: options.rateLimitWindowMs ?? config.rateLimitWindowMs,
      max: options.rateLimitMax ?? config.rateLimitMax,
    }),
  );
  app.get("/openapi.json", (_req, res) => {
    res.json(openApiDocument);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/health", healthRouter(favoritesStore));
  app.use("/pokemon", pokemonRouter);
  app.use("/favorites", createFavoritesRouter(favoritesStore));
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
