import express from "express";
import { healthRouter } from "./modules/health/route.js";
import { pokemonRouter } from "./modules/pokemon/route.js";

export const app = express();

app.use(express.json());
app.use("/health", healthRouter);
app.use("/pokemon", pokemonRouter);
