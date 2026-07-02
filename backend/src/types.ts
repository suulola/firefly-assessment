export interface CreateAppOptions {
  favoritesStorePath?: string;
  corsOrigin?: string;
  pokeApiTimeoutMs?: number;
  pokeApiCacheTtlMs?: number;
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
}
