import { useQuery } from "@tanstack/react-query";
import { getPokemonDetail, type PokemonDetail } from "@/services/pokemonService";
import { pokemonKeys } from "@/hooks/queryKeys";

export function usePokemonDetail(id: number | null) {
  return useQuery<PokemonDetail>({
    queryKey: pokemonKeys.detail(id ?? -1),
    queryFn: ({ signal }) => getPokemonDetail(id as number, signal),
    enabled: id != null,
  });
}
