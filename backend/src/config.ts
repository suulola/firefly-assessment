import { fileURLToPath } from "node:url";

export interface AppConfig {
  port: number;
  corsOrigin?: string;
  favoritesStorePath: string;
  pokeApiTimeoutMs: number;
  pokeApiCacheTtlMs: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  nodeEnv: string;
}

const DEFAULT_PORT = 4000;
const DEFAULT_POKEAPI_TIMEOUT_MS = 5_000;
const DEFAULT_POKEAPI_CACHE_TTL_MS = 5 * 60_000;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 300;
const DEFAULT_FAVORITES_STORE_PATH = fileURLToPath(
  new URL("../data/favorites.json", import.meta.url),
);

function readPositiveInteger(
  env: NodeJS.ProcessEnv,
  name: string,
  defaultValue: number,
): number {
  const rawValue = env[name];
  if (rawValue == null || rawValue.trim() === "") return defaultValue;

  const value = Number(rawValue);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    port: readPositiveInteger(env, "PORT", DEFAULT_PORT),
    corsOrigin: env.CORS_ORIGIN,
    favoritesStorePath: env.FAVORITES_STORE_PATH ?? DEFAULT_FAVORITES_STORE_PATH,
    pokeApiTimeoutMs: readPositiveInteger(
      env,
      "POKEAPI_TIMEOUT_MS",
      DEFAULT_POKEAPI_TIMEOUT_MS,
    ),
    pokeApiCacheTtlMs: readPositiveInteger(
      env,
      "POKEAPI_CACHE_TTL_MS",
      DEFAULT_POKEAPI_CACHE_TTL_MS,
    ),
    rateLimitWindowMs: readPositiveInteger(
      env,
      "RATE_LIMIT_WINDOW_MS",
      DEFAULT_RATE_LIMIT_WINDOW_MS,
    ),
    rateLimitMax: readPositiveInteger(env, "RATE_LIMIT_MAX", DEFAULT_RATE_LIMIT_MAX),
    nodeEnv: env.NODE_ENV ?? "development",
  };
}
