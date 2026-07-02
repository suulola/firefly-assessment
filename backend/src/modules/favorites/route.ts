import { Router } from "express";
import {
  catchErrorResponse,
  errorResponse,
  successResponse,
} from "@/http/response.js";
import type { FavoritesStore } from "@/modules/favorites/types.js";
import { addFavorite, listFavorites, removeFavorite } from "@/modules/favorites/service.js";

export function createFavoritesRouter(store: FavoritesStore): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    try {
      const favorites = await listFavorites(store);
      successResponse(res, favorites, "Favorites loaded.");
    } catch {
      catchErrorResponse(res, "Failed to load favorites.");
    }
  });

  router.post("/", async (req, res) => {
    const id = Number(req.body?.id);
    if (!Number.isInteger(id)) {
      errorResponse(res, 400, "id must be an integer.");
      return;
    }
    try {
      await addFavorite(store, id);
      successResponse(res, { id }, "Favorite saved.");
    } catch {
      catchErrorResponse(res, "Failed to save this favorite.");
    }
  });

  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      errorResponse(res, 400, "id must be an integer.");
      return;
    }
    try {
      await removeFavorite(store, id);
      successResponse(res, { id }, "Favorite removed.");
    } catch {
      catchErrorResponse(res, "Failed to remove this favorite.");
    }
  });

  return router;
}
