import cors from "cors";
import express from "express";
import { buildCorsOptions } from "@/corsConfig.js";
import type { CreateAppOptions } from "@/types.js";
import { healthRouter } from "@/modules/health/route.js";
import { pokemonRouter } from "@/modules/pokemon/route.js";
import { createFavoritesRouter } from "@/modules/favorites/route.js";
import { createFileFavoritesStore } from "@/modules/favorites/repository.js";

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const favoritesStore = createFileFavoritesStore(
    options.favoritesStorePath ?? process.env.FAVORITES_STORE_PATH,
  );

  app.use(cors(buildCorsOptions(options.corsOrigin ?? process.env.CORS_ORIGIN)));
  app.use(express.json());
  app.use("/health", healthRouter);
  app.use("/pokemon", pokemonRouter);
  app.use("/favorites", createFavoritesRouter(favoritesStore));

  return app;
}

export const app = createApp();
