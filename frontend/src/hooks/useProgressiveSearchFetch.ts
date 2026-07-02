import { useEffect } from "react";
import type { InfiniteQueryObserverResult } from "@tanstack/react-query";

interface UseProgressiveSearchFetchOptions {
  query: string;
  resultCount: number;
  status: "loading" | "error" | "ready";
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult>;
  enabled: boolean;
}

// Keeps fetching pages in the background while a search has zero results,
// so a match beyond the first page still turns up without the user having
// to scroll to trigger it themselves. Bounded on every axis:
//   - `hasNextPage` (from the backend's own hasMore) stops it once every
//     page has been loaded — it can never loop past the real dataset.
//   - `isFetchingNextPage` prevents overlapping fetchNextPage calls.
//   - `resultCount > 0` stops it the moment a match exists.
//   - `enabled` lets the caller rule out fetches that can never help (e.g.
//     a favorites-only filter with no favorites at all).
export function useProgressiveSearchFetch({
  query,
  resultCount,
  status,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  enabled,
}: UseProgressiveSearchFetchOptions) {
  useEffect(() => {
    if (
      enabled &&
      query !== "" &&
      resultCount === 0 &&
      status === "ready" &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  }, [enabled, query, resultCount, status, hasNextPage, isFetchingNextPage, fetchNextPage]);
}
