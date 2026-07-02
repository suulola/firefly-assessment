import { useInfiniteQuery } from "@tanstack/react-query";
import { getPokemonListPage, type PokemonListPage } from "@/services/pokemonService";
import { pokemonKeys } from "@/hooks/queryKeys";

export function usePokemonList(pageSize: number) {
  return useInfiniteQuery({
    queryKey: pokemonKeys.list(),
    queryFn: ({ pageParam, signal }) => getPokemonListPage(pageSize, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage: PokemonListPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
  });
}
