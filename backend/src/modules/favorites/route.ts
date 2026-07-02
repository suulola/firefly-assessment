import { Router } from "express";
import { HttpError } from "@/http/errors.js";
import { asyncHandler } from "@/http/middleware.js";
import { parseFavoriteBody, parsePositiveInteger } from "@/http/validation.js";
import { successResponse } from "@/http/response.js";
import type { FavoritesStore } from "@/modules/favorites/types.js";
import { addFavorite, listFavorites, removeFavorite } from "@/modules/favorites/service.js";

function storageError(error: unknown, message: string): HttpError {
  return new HttpError(500, message, { code: "FAVORITES_STORAGE_ERROR", cause: error });
}

export function createFavoritesRouter(store: FavoritesStore): Router {
  const router = Router();

  router.get("/", asyncHandler(async (_req, res, next) => {
    try {
      const favorites = await listFavorites(store);
      successResponse(res, favorites, "Favorites loaded.");
    } catch (error) {
      next(storageError(error, "Failed to load favorites."));
    }
  }));

  router.post("/", asyncHandler(async (req, res, next) => {
    const { id } = parseFavoriteBody(req.body);
    try {
      await addFavorite(store, id);
      successResponse(res, { id }, "Favorite saved.");
    } catch (error) {
      next(storageError(error, "Failed to save this favorite."));
    }
  }));

  router.delete("/:id", asyncHandler(async (req, res, next) => {
    const id = parsePositiveInteger(req.params.id, "id");
    try {
      await removeFavorite(store, id);
      successResponse(res, { id }, "Favorite removed.");
    } catch (error) {
      next(storageError(error, "Failed to remove this favorite."));
    }
  }));

  return router;
}
