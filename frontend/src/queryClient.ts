import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { reportMutationError, reportQueryError } from "@/lib/observability";

function shouldRetry(failureCount: number, error: unknown): boolean {
  return failureCount < 2 && error instanceof TypeError;
}

export function createQueryClient() {
  return new QueryClient({
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
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
