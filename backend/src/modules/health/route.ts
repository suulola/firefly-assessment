import { Router } from "express";
import { errorResponse, successResponse } from "../../http/response.js";
import { checkLiveness, checkPokeApiReachable } from "./service.js";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  successResponse(res, checkLiveness(), "Backend is healthy.");
});

healthRouter.get("/pokeapi", async (_req, res) => {
  const result = await checkPokeApiReachable();
  if (result.reachable) {
    const data = { status: "ok", pokeapi: "reachable" };
    successResponse(
      res,
      data,
      "PokéAPI is reachable.",
    );
  } else {
    errorResponse(res, 502, "PokéAPI is unreachable.");
  }
});
