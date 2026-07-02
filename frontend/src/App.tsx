import { useState } from "react";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetail } from "./components/PokemonDetail";
import { Toast } from "./components/Toast";
import { addFavorite, removeFavorite } from "./lib/pokemonClient";
import styles from "./App.module.css";

const TOAST_DURATION_MS = 2000;

export function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }

  async function toggleFavorite(id: number) {
    const wasFavorited = favoriteIds.has(id);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (wasFavorited) await removeFavorite(id);
      else await addFavorite(id);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(id);
        else next.delete(id);
        return next;
      });
      showToast("Couldn't save — try again.");
    }
  }

  return (
    <div className={styles.page}>
      <PokemonList
        selectedId={selectedId}
        onSelect={setSelectedId}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
      <PokemonDetail
        pokemonId={selectedId}
        onSelect={setSelectedId}
        favoriteIds={favoriteIds}
        onToggleFavorite={toggleFavorite}
      />
      {toastMessage && <Toast message={toastMessage} />}
    </div>
  );
}
