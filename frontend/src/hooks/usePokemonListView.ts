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
