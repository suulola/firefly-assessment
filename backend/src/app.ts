import express from "express";
import { healthRouter } from "./modules/health/route.js";
import { pokemonRouter } from "./modules/pokemon/route.js";
import { createFavoritesRouter } from "./modules/favorites/route.js";
import { createFileFavoritesStore } from "./modules/favorites/repository.js";

export interface CreateAppOptions {
  favoritesStorePath?: string;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const favoritesStore = createFileFavoritesStore(options.favoritesStorePath);

  app.use(express.json());
  app.use("/health", healthRouter);
  app.use("/pokemon", pokemonRouter);
  app.use("/favorites", createFavoritesRouter(favoritesStore));

  return app;
}

export const app = createApp();
