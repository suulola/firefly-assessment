import { POKEAPI_BASE_URL, pokeApiGet } from "@/modules/pokemon/repository.js";
import type {
  EvolutionStage,
  PokeApiEvolutionChain,
  PokeApiEvolutionNode,
  PokeApiListResponse,
  PokeApiPokemon,
  PokeApiSpecies,
  PokemonDetail,
  PokemonListPage,
} from "@/modules/pokemon/types.js";

function spriteUrlFor(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function idFromUrl(url: string): number {
  const segments = url.split("/").filter(Boolean);
  return Number(segments[segments.length - 1]);
}

const FIRST_GENERATION_TOTAL = 150;

export async function getPokemonListPage(
  limit: number,
  offset: number,
): Promise<PokemonListPage> {
  const normalizedLimit = Math.min(Math.max(limit, 1), FIRST_GENERATION_TOTAL);
  const normalizedOffset = Math.min(Math.max(offset, 0), FIRST_GENERATION_TOTAL);
  const remaining = Math.max(FIRST_GENERATION_TOTAL - normalizedOffset, 0);
  const pageSize = Math.min(normalizedLimit, remaining);

  const { results } = await pokeApiGet<PokeApiListResponse>(
    `/pokemon?limit=${pageSize}&offset=${normalizedOffset}`,
  );

  const items = results
    .map(({ name, url }) => {
      const id = idFromUrl(url);
      return { id, name, spriteUrl: spriteUrlFor(id) };
    })
    .sort((a, b) => a.id - b.id);

  return {
    items,
    total: FIRST_GENERATION_TOTAL,
    limit: pageSize,
    offset: normalizedOffset,
    hasMore: normalizedOffset + items.length < FIRST_GENERATION_TOTAL,
  };
}

export function flattenEvolutionChain(chain: PokeApiEvolutionNode): EvolutionStage[] {
  const stages: EvolutionStage[] = [];
  const walk = (node: PokeApiEvolutionNode) => {
    const id = idFromUrl(node.species.url);
    stages.push({ id, name: node.species.name, spriteUrl: spriteUrlFor(id) });
    node.evolves_to.forEach(walk);
  };
  walk(chain);
  return stages;
}

export async function getPokemonDetail(id: string): Promise<PokemonDetail> {
  const [poke, species] = await Promise.all([
    pokeApiGet<PokeApiPokemon>(`/pokemon/${id}`),
    pokeApiGet<PokeApiSpecies>(`/pokemon-species/${id}`),
  ]);

  const types = [...poke.types]
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);
  const abilities = poke.abilities.map((a) => ({
    name: a.ability.name,
    hidden: a.is_hidden,
  }));

  let evolutions: EvolutionStage[] = [];
  if (species.evolution_chain) {
    const chainPath = species.evolution_chain.url.replace(POKEAPI_BASE_URL, "");
    const chainData = await pokeApiGet<PokeApiEvolutionChain>(chainPath);
    evolutions = flattenEvolutionChain(chainData.chain);
  }

  return {
    id: poke.id,
    name: poke.name,
    spriteUrl: spriteUrlFor(poke.id),
    types,
    abilities,
    evolutions,
  };
}
