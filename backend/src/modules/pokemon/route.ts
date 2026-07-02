import { Router } from "express";
import { catchErrorResponse, successResponse } from "../../http/response.js";
import { getPokemonDetail, getPokemonListPage } from "./service.js";

export const pokemonRouter = Router();

const DEFAULT_LIST_LIMIT = 30;

pokemonRouter.get("/", async (_req, res) => {
  try {
    const limit = Number(_req.query.limit ?? DEFAULT_LIST_LIMIT);
    const offset = Number(_req.query.offset ?? 0);
    const data = await getPokemonListPage(
        Number.isFinite(limit) ? limit : DEFAULT_LIST_LIMIT,
        Number.isFinite(offset) ? offset : 0,
      );
    successResponse(
      res,
      data,
      "Pokémon list loaded.",
    );
  } catch {
    catchErrorResponse(res, "Failed to load the Pokémon list.");
  }
});

pokemonRouter.get("/:id", async (req, res) => {
  try {
    successResponse(res, await getPokemonDetail(req.params.id), "Pokémon loaded.");
  } catch {
    catchErrorResponse(res, "Failed to load this Pokémon.");
  }
});
