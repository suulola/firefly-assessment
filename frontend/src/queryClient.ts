import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportMutationError, reportQueryError } from "@/lib/observability";

// Real network failures (fetch itself rejecting — offline, DNS, connection
// refused) throw a TypeError. Every other failure this app produces — an
// HTTP error envelope, a Zod schema mismatch — is a deliberately-thrown
// Error from readApiResponse/parsePayload, and retrying those wastes time:
// the backend replying the same way twice, or the payload shape being
// wrong, isn't fixed by asking again. So only the TypeError case retries,
// capped at 2 attempts.
function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < 2 && error instanceof TypeError;
}

export function createQueryClient() {
  return new QueryClient({
    // Cross-cutting: every query/mutation failure gets reported here
    // regardless of whether anything is currently rendering the error inline.
    // No toasts here — that's `useFavorites`'s job for the one mutation that
    // needs one; showing a toast for every background query error would be
    // noisy and often not user-actionable.
    queryCache: new QueryCache({
      onError: (error, query) => {
        reportQueryError(error, {
          source: Array.isArray(query.queryKey) ? query.queryKey.join(".") : "query",
          queryKey: query.queryKey,
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        if (mutation.options.meta?.suppressGlobalErrorReport === true) return;
        reportMutationError(error, {
          source: Array.isArray(mutation.options.mutationKey)
            ? mutation.options.mutationKey.join(".")
            : "mutation",
          mutationKey: mutation.options.mutationKey,
        });
      },
    }),
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        // Pokémon list/detail data barely changes; treating it as fresh for
        // 30s avoids a refetch on every panel remount without noticeably
        // staling the UI.
        staleTime: 30_000,
        // Default (5 minutes) — stated explicitly so it reads as a decision,
        // not an omission.
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        // Favorite toggles have their own optimistic-update/rollback flow in
        // useFavorites — an automatic retry would refire the mutation after
        // the rollback already ran, which is exactly the double-fire this
        // app's tests guard against. Failures surface via that flow instead.
        retry: false,
      },
    },
  });
}
