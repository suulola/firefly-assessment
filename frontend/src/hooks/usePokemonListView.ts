import { useState } from "react";
import { usePokemonList } from "@/hooks/usePokemonList";
import type { PokemonListItem } from "@/services/pokemonService";
import { formatName } from "@/lib/pokemonFormat";
import { useProgressiveSearchFetch } from "@/hooks/useProgressiveSearchFetch";

const PAGE_SIZE = 30;

export type PokemonListStatus = "loading" | "error" | "ready";

interface UsePokemonListViewResult {
  items: PokemonListItem[];
  status: PokemonListStatus;
  total: number;
  isFetchingNextPage: boolean;
  favoritesOnly: boolean;
  toggleFavoritesOnly: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onScrollNearBottom: () => void;
  refetch: () => void;
}

// Owns every piece of state PokemonList.tsx used to hold directly
// (favoritesOnly, searchQuery) plus the query cache and the fetch-more
// decision, so there is one place — testable via renderHook, no scroll-event
// stubbing — that answers "what's on screen and should we fetch more",
// instead of two independent callers reaching for fetchNextPage coordinated
// only by a shared isFetchingNextPage boolean.
//
// `items` is the full filtered array, unsliced — PokemonList.tsx virtualizes
// over it, so there's no need for this hook to also batch how much of it is
// "revealed" the way a pre-virtualization DOM-bound list would.
export function usePokemonListView(favoriteIds: Set<number>): UsePokemonListViewResult {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pokemonQuery = usePokemonList(PAGE_SIZE);
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = pokemonQuery;

  const allItems: PokemonListItem[] = pokemonQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const total = pokemonQuery.data?.pages[0]?.total ?? 0;
  const status: PokemonListStatus = pokemonQuery.isPending
    ? "loading"
    : pokemonQuery.isError
      ? "error"
      : "ready";

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const items = allItems
    .filter((item) => !favoritesOnly || favoriteIds.has(item.id))
    .filter(
      (item) =>
        normalizedQuery === "" ||
        formatName(item.name).toLowerCase().includes(normalizedQuery),
    );

  const canLoadMoreUnfiltered = status === "ready" && hasNextPage && !favoritesOnly;

  // Search only filters pages already fetched. Keep fetching further pages
  // in the background — bounded by the known 150-Pokémon total via
  // hasNextPage — until a match turns up or every page has been loaded.
  // Disabled when favorites-only is on with zero favorites: no amount of
  // additional fetching can ever produce a match in that case, so it would
  // just be pointless background network traffic (still fine when the user
  // *does* have favorites — a matching favorite may live on an unfetched page).
  useProgressiveSearchFetch({
    query: normalizedQuery,
    resultCount: items.length,
    status,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    enabled: !favoritesOnly || favoriteIds.size > 0,
  });

  function onScrollNearBottom() {
    if (!canLoadMoreUnfiltered || isFetchingNextPage) return;
    void fetchNextPage();
  }

  function toggleFavoritesOnly() {
    setFavoritesOnly((prev) => !prev);
  }

  return {
    items,
    status,
    total,
    isFetchingNextPage,
    favoritesOnly,
    toggleFavoritesOnly,
    searchQuery,
    setSearchQuery,
    onScrollNearBottom,
    refetch: () => pokemonQuery.refetch(),
  };
}
