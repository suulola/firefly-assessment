import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProgressiveSearchFetch } from "../src/hooks/useProgressiveSearchFetch";

function baseOptions() {
  return {
    query: "pika",
    resultCount: 0,
    status: "ready" as const,
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: vi.fn().mockResolvedValue({}),
    enabled: true,
  };
}

describe("useProgressiveSearchFetch", () => {
  it("fetches the next page when the search has zero results and more pages exist", () => {
    const options = baseOptions();

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not fetch once a result exists", () => {
    const options = { ...baseOptions(), resultCount: 1 };

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch once every page has already loaded (hasNextPage false)", () => {
    const options = { ...baseOptions(), hasNextPage: false };

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch while a page is already in flight", () => {
    const options = { ...baseOptions(), isFetchingNextPage: true };

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch when the search query is empty", () => {
    const options = { ...baseOptions(), query: "" };

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch when disabled (e.g. favorites-only with zero favorites, per usePokemonListView)", () => {
    const options = { ...baseOptions(), enabled: false };

    renderHook(() => useProgressiveSearchFetch(options));

    expect(options.fetchNextPage).not.toHaveBeenCalled();
  });

  it("does not fetch while the list is still loading or errored", () => {
    const loading = { ...baseOptions(), status: "loading" as const };
    const errored = { ...baseOptions(), status: "error" as const };

    renderHook(() => useProgressiveSearchFetch(loading));
    renderHook(() => useProgressiveSearchFetch(errored));

    expect(loading.fetchNextPage).not.toHaveBeenCalled();
    expect(errored.fetchNextPage).not.toHaveBeenCalled();
  });
});
