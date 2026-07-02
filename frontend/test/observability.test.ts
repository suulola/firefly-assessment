import { afterEach, describe, expect, it, vi } from "vitest";
import {
  reportError,
  reportMutationError,
  reportQueryError,
  resetErrorSink,
  setErrorSink,
} from "../src/lib/observability";

afterEach(() => {
  resetErrorSink();
});

describe("observability", () => {
  it("routes reportError through the configured sink with its context", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    const error = new Error("boom");

    reportError(error, { source: "TestComponent", action: "render", extra: { id: 1 } });

    expect(sink).toHaveBeenCalledWith(error, {
      source: "TestComponent",
      action: "render",
      extra: { id: 1 },
    });
  });

  it("reportQueryError tags the action as 'query' and folds in the query key", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    const error = new Error("query failed");

    reportQueryError(error, { source: "usePokemonList", queryKey: ["pokemon", "list"] });

    expect(sink).toHaveBeenCalledWith(error, {
      source: "usePokemonList",
      action: "query",
      extra: { queryKey: ["pokemon", "list"] },
    });
  });

  it("reportMutationError tags the action as 'mutation' and folds in the mutation key", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    const error = new Error("mutation failed");

    reportMutationError(error, {
      source: "useFavorites",
      mutationKey: ["favorites", "toggle"],
      extra: { id: 5 },
    });

    expect(sink).toHaveBeenCalledWith(error, {
      source: "useFavorites",
      action: "mutation",
      extra: { id: 5, mutationKey: ["favorites", "toggle"] },
    });
  });

  it("resetErrorSink restores the no-op default so tests stay quiet by default", () => {
    const sink = vi.fn();
    setErrorSink(sink);
    resetErrorSink();

    // Should not throw, and should not still be routed through the spy.
    reportError(new Error("after reset"), { source: "x" });

    expect(sink).not.toHaveBeenCalled();
  });
});
