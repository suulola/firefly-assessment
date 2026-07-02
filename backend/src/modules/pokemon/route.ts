import { Router } from "express";
import { getPokemonList } from "./service.js";

export const pokemonRouter = Router();

pokemonRouter.get("/", async (_req, res) => {
  try {
    res.status(200).json(await getPokemonList());
  } catch {
    res.status(502).json({ error: "Failed to load the Pokémon list." });
  }
});
