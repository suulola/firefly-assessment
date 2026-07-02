import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createQueryClient } from "../src/queryClient";
import { resetErrorSink, setErrorSink } from "../src/lib/observability";

afterEach(() => {
  resetErrorSink();
});

function makeWrapper(queryClient: ReturnType<typeof createQueryClient>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("createQueryClient retry policy", () => {
  it("retries a real network failure (TypeError) up to 2 extra attempts", async () => {
    const queryClient = createQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["retry-network"],
          queryFn,
          retryDelay: 0,
        }),
      { wrapper: makeWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryFn).toHaveBeenCalledTimes(3);
  });

  it("does not retry an application error (malformed data, HTTP failure)", async () => {
    const queryClient = createQueryClient();
    const queryFn = vi.fn().mockRejectedValue(new Error("Received invalid data."));

    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["retry-app-error"],
          queryFn,
          retryDelay: 0,
        }),
      { wrapper: makeWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(queryFn).toHaveBeenCalledTimes(1);
  });
});

describe("createQueryClient global error reporting", () => {
  it("reports query failures through observability, tagged with the query key", async () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);
    const queryClient = createQueryClient();
    const error = new Error("list failed");

    const { result } = renderHook(
      () =>
        useQuery({
          queryKey: ["pokemon", "list"],
          queryFn: () => Promise.reject(error),
          retryDelay: 0,
        }),
      { wrapper: makeWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(errorSink).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ source: "pokemon.list", action: "query" }),
    );
  });

  it("reports mutation failures through observability, tagged with the mutation key", async () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);
    const queryClient = createQueryClient();
    const error = new Error("mutation failed");

    const { result } = renderHook(
      () =>
        useMutation({
          mutationKey: ["favorites", "toggle"],
          mutationFn: () => Promise.reject(error),
        }),
      { wrapper: makeWrapper(queryClient) },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(errorSink).toHaveBeenCalledWith(
      error,
      expect.objectContaining({ source: "favorites.toggle", action: "mutation" }),
    );
  });

  it("lets a locally handled mutation suppress duplicate global reporting", async () => {
    const errorSink = vi.fn();
    setErrorSink(errorSink);
    const queryClient = createQueryClient();
    const error = new Error("mutation failed");

    const { result } = renderHook(
      () =>
        useMutation({
          mutationKey: ["favorites", "toggle"],
          meta: { suppressGlobalErrorReport: true },
          mutationFn: () => Promise.reject(error),
        }),
      { wrapper: makeWrapper(queryClient) },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(errorSink).not.toHaveBeenCalled();
  });
});
