import { Router } from "express";
import { HttpError } from "@/http/errors.js";
import { asyncHandler } from "@/http/middleware.js";
import { parsePositiveInteger, validateListQuery } from "@/http/validation.js";
import { successResponse } from "@/http/response.js";
import { PokeApiError } from "@/modules/pokemon/repository.js";
import { getPokemonDetail, getPokemonListPage } from "@/modules/pokemon/service.js";

export const pokemonRouter = Router();

function toPokemonHttpError(error: unknown, message: string): HttpError {
  if (error instanceof PokeApiError) {
    return new HttpError(502, message, {
      code: error.kind === "timeout" ? "POKEAPI_TIMEOUT" : "POKEAPI_UNAVAILABLE",
      cause: error,
    });
  }
  if (error instanceof HttpError) return error;
  return new HttpError(502, message, { code: "POKEAPI_UNAVAILABLE", cause: error });
}

pokemonRouter.get("/", asyncHandler(async (req, res, next) => {
  const { limit, offset } = validateListQuery(req.query);
  try {
    const list = await getPokemonListPage(limit, offset);
    successResponse(res, list, "Pokémon list loaded.");
  } catch (error) {
    next(toPokemonHttpError(error, "Failed to load the Pokémon list."));
  }
}));

pokemonRouter.get("/:id", asyncHandler(async (req, res, next) => {
  const id = parsePositiveInteger(req.params.id, "id");
  try {
    const detail = await getPokemonDetail(id);
    successResponse(res, detail, "Pokémon loaded.");
  } catch (error) {
    next(toPokemonHttpError(error, "Failed to load this Pokémon."));
  }
}));
