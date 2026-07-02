import { useMemo, useState } from "react";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
  type MutationFilters,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favoritesService";
import { favoriteKeys } from "@/hooks/queryKeys";
import { reportMutationError } from "@/lib/observability";

interface ToggleFavoriteVariables {
  id: number;
}

interface ToggleFavoriteContext {
  previousIds: number[];
  wasFavorited: boolean;
}

function pendingMutationFilter(id: number): MutationFilters {
  return {
    mutationKey: favoriteKeys.toggleMutation,
    predicate: (m) =>
      (m.state.variables as ToggleFavoriteVariables | undefined)?.id === id &&
      m.state.status === "pending",
  };
}

export function useFavorites() {
  const queryClient = useQueryClient();
  const [favoriteErrors, setFavoriteErrors] = useState<Record<number, string>>({});

  const favoritesQuery = useQuery({
    queryKey: favoriteKeys.all,
    queryFn: ({ signal }) => getFavorites(signal),
  });

  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data ?? []),
    [favoritesQuery.data],
  );

  const pendingIds = useMutationState({
    filters: { mutationKey: favoriteKeys.toggleMutation, status: "pending" },
    select: (mutation) => (mutation.state.variables as ToggleFavoriteVariables).id,
  });
  const pendingIdSet = new Set(pendingIds);

  function clearFavoriteError(id: number) {
    setFavoriteErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const favoriteMutation = useMutation({
    mutationKey: favoriteKeys.toggleMutation,
    meta: { suppressGlobalErrorReport: true },
    mutationFn: async ({ id }: ToggleFavoriteVariables) => {
      const mutation = queryClient
        .getMutationCache()
        .find<unknown, unknown, ToggleFavoriteVariables, ToggleFavoriteContext>(
          pendingMutationFilter(id),
        );
      const wasFavorited = mutation?.state.context?.wasFavorited ?? false;
      if (wasFavorited) await removeFavorite(id);
      else await addFavorite(id);
      return { id, wasFavorited };
    },
    onMutate: async ({ id }): Promise<ToggleFavoriteContext> => {
      clearFavoriteError(id);
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });

      const previousIds = queryClient.getQueryData<number[]>(favoriteKeys.all) ?? [];
      const wasFavorited = previousIds.includes(id);

      queryClient.setQueryData<number[]>(favoriteKeys.all, (current = []) => {
        const next = new Set(current);
        if (wasFavorited) next.delete(id);
        else next.add(id);
        return [...next].sort((a, b) => a - b);
      });

      return { previousIds, wasFavorited };
    },
    onError: (error, { id }, context) => {
      queryClient.setQueryData(favoriteKeys.all, context?.previousIds ?? []);
      setFavoriteErrors((prev) => ({
        ...prev,
        [id]: "Couldn't save. Try again.",
      }));
      toast.error("Couldn't save favorite.");
      reportMutationError(error, {
        source: "useFavorites",
        mutationKey: favoriteKeys.toggleMutation,
        extra: { id },
      });
    },
    onSuccess: ({ wasFavorited }) => {
      toast.success(wasFavorited ? "Favorite removed." : "Favorite saved.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoriteKeys.all });
    },
  });

  function toggleFavorite(id: number) {
    const alreadyPending = queryClient.isMutating(pendingMutationFilter(id)) > 0;
    if (alreadyPending) return;
    favoriteMutation.mutate({ id });
  }

  function isFavoritePending(id: number) {
    return pendingIdSet.has(id);
  }

  return {
    favoriteIds,
    favoriteErrors,
    toggleFavorite,
    isFavoritePending,
  };
}
