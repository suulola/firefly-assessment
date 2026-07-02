import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PokemonDetail } from "@/components/PokemonDetail";
import { PokemonList } from "@/components/PokemonList";
import { QueryErrorBoundary } from "@/components/QueryErrorBoundary";
import { useFavorites } from "@/hooks/useFavorites";
import { createQueryClient } from "@/queryClient";
import styles from "@/App.module.scss";

export function App() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary title="The app crashed" className={styles.appError}>
        <PokemonExplorer />
      </QueryErrorBoundary>
    </QueryClientProvider>
  );
}

function PokemonExplorer() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { favoriteIds, favoriteErrors, toggleFavorite, isFavoritePending } = useFavorites();

  const mobileView = selectedId === null ? "list" : "detail";

  return (
    <div className={styles.page} data-mobile-view={mobileView}>
      <Toaster position="bottom-right" richColors />
      <QueryErrorBoundary title="The Pokémon list crashed" className={styles.listPanelError}>
        <PokemonList
          selectedId={selectedId}
          onSelect={setSelectedId}
          favoriteIds={favoriteIds}
          favoriteErrors={favoriteErrors}
          onToggleFavorite={toggleFavorite}
          isFavoritePending={isFavoritePending}
        />
      </QueryErrorBoundary>
      <QueryErrorBoundary title="The detail view crashed" className={styles.detailPanelError}>
        <PokemonDetail
          pokemonId={selectedId}
          onSelect={setSelectedId}
          onBack={() => setSelectedId(null)}
          favoriteIds={favoriteIds}
          favoriteErrors={favoriteErrors}
          onToggleFavorite={toggleFavorite}
          isFavoritePending={isFavoritePending}
        />
      </QueryErrorBoundary>
    </div>
  );
}
