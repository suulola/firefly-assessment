import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PokemonDetail } from "@/components/PokemonDetail";
import { PokemonList } from "@/components/PokemonList";
import { useFavorites } from "@/hooks/useFavorites";
import { createQueryClient } from "@/queryClient";
import styles from "@/App.module.css";

export function App() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <PokemonExplorer />
    </QueryClientProvider>
  );
}

function PokemonExplorer() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { favoriteIds, favoriteErrors, toggleFavorite } = useFavorites();

  return (
    <div className={styles.page}>
      <Toaster position="bottom-right" richColors />
      <PokemonList
        selectedId={selectedId}
        onSelect={setSelectedId}
        favoriteIds={favoriteIds}
        favoriteErrors={favoriteErrors}
        onToggleFavorite={toggleFavorite}
      />
      <PokemonDetail
        pokemonId={selectedId}
        onSelect={setSelectedId}
        favoriteIds={favoriteIds}
        favoriteErrors={favoriteErrors}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
