import { Router } from "express";
import { checkLiveness, checkPokeApiReachable } from "./service.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.status(200).json(checkLiveness());
});

healthRouter.get("/pokeapi", async (_req, res) => {
  const result = await checkPokeApiReachable();
  if (result.reachable) {
    res.status(200).json({ status: "ok", pokeapi: "reachable" });
  } else {
    res.status(502).json({ status: "error", pokeapi: "unreachable" });
  }
});
