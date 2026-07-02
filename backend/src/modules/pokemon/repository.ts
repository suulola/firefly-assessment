import type {
  PokeApiEvolutionChain,
  PokeApiListResponse,
  PokeApiPokemon,
  PokeApiSpecies,
} from "@/modules/pokemon/types.js";

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

interface PokeApiRepositoryConfig {
  timeoutMs: number;
  cacheTtlMs: number;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

export type PokeApiErrorKind = "network" | "timeout" | "http" | "invalid_response";

export class PokeApiError extends Error {
  readonly kind: PokeApiErrorKind;
  readonly status?: number;

  constructor(
    message: string,
    options: { kind: PokeApiErrorKind; status?: number; cause?: unknown },
  ) {
    super(message, { cause: options.cause });
    this.name = "PokeApiError";
    this.kind = options.kind;
    this.status = options.status;
  }
}

let repositoryConfig: PokeApiRepositoryConfig = {
  timeoutMs: 5_000,
  cacheTtlMs: 5 * 60_000,
};

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_ENTRIES = 128;

export function configurePokeApiRepository(config: Partial<PokeApiRepositoryConfig>) {
  repositoryConfig = { ...repositoryConfig, ...config };
}

export function clearPokeApiCache() {
  cache.clear();
}

function readCache<T>(path: string): T | undefined {
  const entry = cache.get(path);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(path);
    return undefined;
  }
  return entry.value as T;
}

function writeCache(path: string, value: unknown) {
  if (repositoryConfig.cacheTtlMs <= 0) return;
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value as string | undefined;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(path, { value, expiresAt: Date.now() + repositoryConfig.cacheTtlMs });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasNamedResource(value: unknown): value is { name: string; url: string } {
  return isObject(value) && typeof value.name === "string" && typeof value.url === "string";
}

function isPokeApiListResponse(value: unknown): value is PokeApiListResponse {
  return (
    isObject(value) &&
    Array.isArray(value.results) &&
    value.results.every(hasNamedResource)
  );
}

function isPokeApiPokemon(value: unknown): value is PokeApiPokemon {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    Array.isArray(value.types) &&
    value.types.every(
      (type) =>
        isObject(type) &&
        typeof type.slot === "number" &&
        isObject(type.type) &&
        typeof type.type.name === "string",
    ) &&
    Array.isArray(value.abilities) &&
    value.abilities.every(
      (ability) =>
        isObject(ability) &&
        isObject(ability.ability) &&
        typeof ability.ability.name === "string" &&
        typeof ability.is_hidden === "boolean",
    )
  );
}

function isPokeApiSpecies(value: unknown): value is PokeApiSpecies {
  return (
    isObject(value) &&
    (value.evolution_chain === null ||
      (isObject(value.evolution_chain) && typeof value.evolution_chain.url === "string"))
  );
}

function isEvolutionNode(value: unknown): boolean {
  return (
    isObject(value) &&
    hasNamedResource(value.species) &&
    Array.isArray(value.evolves_to) &&
    value.evolves_to.every(isEvolutionNode)
  );
}

function isPokeApiEvolutionChain(value: unknown): value is PokeApiEvolutionChain {
  return isObject(value) && isEvolutionNode(value.chain);
}

function validateUpstreamResponse(path: string, value: unknown): unknown {
  if (path.startsWith("/pokemon?") && isPokeApiListResponse(value)) return value;
  if (path.startsWith("/pokemon/") && isPokeApiPokemon(value)) return value;
  if (path.startsWith("/pokemon-species/") && isPokeApiSpecies(value)) return value;
  if (path.startsWith("/evolution-chain/") && isPokeApiEvolutionChain(value)) return value;
  throw new PokeApiError(`PokéAPI response for ${path} was invalid`, {
    kind: "invalid_response",
  });
}

export async function pokeApiGet<T>(path: string): Promise<T> {
  const cached = readCache<T>(path);
  if (cached !== undefined) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), repositoryConfig.timeoutMs);

  let response: Response;
  try {
    response = await fetch(`${POKEAPI_BASE_URL}${path}`, {
      signal: controller.signal,
    });
  } catch (cause) {
    const kind = controller.signal.aborted ? "timeout" : "network";
    throw new PokeApiError(`PokéAPI request to ${path} failed`, { kind, cause });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new PokeApiError(`PokéAPI request to ${path} returned ${response.status}`, {
      kind: "http",
      status: response.status,
    });
  }

  const parsed = validateUpstreamResponse(path, await response.json());
  writeCache(path, parsed);
  return parsed as T;
}
