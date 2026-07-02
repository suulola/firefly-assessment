import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "@/services/favoritesService";

const favoritesQueryKey = ["favorites"] as const;

export function useFavorites() {
  const queryClient = useQueryClient();
  const [favoriteErrors, setFavoriteErrors] = useState<Record<number, string>>({});

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
  });

  const favoriteIds = useMemo(
    () => new Set(favoritesQuery.data ?? []),
    [favoritesQuery.data],
  );

  function clearFavoriteError(id: number) {
    setFavoriteErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  const favoriteMutation = useMutation({
    mutationFn: async ({
      id,
      wasFavorited,
    }: {
      id: number;
      wasFavorited: boolean;
    }) => {
      if (wasFavorited) await removeFavorite(id);
      else await addFavorite(id);
      return { id, wasFavorited };
    },
    onMutate: async ({ id, wasFavorited }) => {
      clearFavoriteError(id);
      await queryClient.cancelQueries({ queryKey: favoritesQueryKey });
      const previousIds = queryClient.getQueryData<number[]>(favoritesQueryKey) ?? [];

      queryClient.setQueryData<number[]>(favoritesQueryKey, (current = []) => {
        const next = new Set(current);
        if (wasFavorited) next.delete(id);
        else next.add(id);
        return [...next].sort((a, b) => a - b);
      });

      return { previousIds };
    },
    onError: (_error, { id }, context) => {
      queryClient.setQueryData(favoritesQueryKey, context?.previousIds ?? []);
      setFavoriteErrors((prev) => ({
        ...prev,
        [id]: "Couldn't save. Try again.",
      }));
      toast.error("Couldn't save favorite.");
    },
    onSuccess: ({ wasFavorited }) => {
      toast.success(wasFavorited ? "Favorite removed." : "Favorite saved.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: favoritesQueryKey });
    },
  });

  function toggleFavorite(id: number) {
    favoriteMutation.mutate({ id, wasFavorited: favoriteIds.has(id) });
  }

  return {
    favoriteIds,
    favoriteErrors,
    toggleFavorite,
  };
}
