import { Router, type Response } from "express";
import { getPokemonDetail, getPokemonList } from "./service.js";

export const pokemonRouter = Router();

function sendError(res: Response, statusCode: number, message: string) {
  res.status(statusCode).json({ statusCode, message });
}

pokemonRouter.get("/", async (_req, res) => {
  try {
    res.status(200).json(await getPokemonList());
  } catch {
    sendError(res, 502, "Failed to load the Pokémon list.");
  }
});

pokemonRouter.get("/:id", async (req, res) => {
  try {
    res.status(200).json(await getPokemonDetail(req.params.id));
  } catch {
    sendError(res, 502, "Failed to load this Pokémon.");
  }
});
