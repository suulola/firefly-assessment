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
