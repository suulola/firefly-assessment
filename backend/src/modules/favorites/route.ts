import { Router, type Response } from "express";
import type { FavoritesStore } from "./repository.js";
import { addFavorite, listFavorites, removeFavorite } from "./service.js";

function sendError(res: Response, statusCode: number, message: string) {
  res.status(statusCode).json({ statusCode, message });
}

export function createFavoritesRouter(store: FavoritesStore): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      res.status(200).json(await listFavorites(store));
    } catch {
      sendError(res, 502, "Failed to load favorites.");
    }
  });

  router.post("/", async (req, res) => {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id)) {
      sendError(res, 400, "id must be an integer.");
      return;
    }
    try {
      await addFavorite(store, id);
      res.status(204).end();
    } catch {
      sendError(res, 502, "Failed to save this favorite.");
    }
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      sendError(res, 400, "id must be an integer.");
      return;
    }
    try {
      await removeFavorite(store, id);
      res.status(204).end();
    } catch {
      sendError(res, 502, "Failed to remove this favorite.");
    }
  });

  return router;
}
