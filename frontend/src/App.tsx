import { useEffect, useState } from "react";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetail } from "./components/PokemonDetail";
import { addFavorite, getFavorites, removeFavorite } from "./lib/pokemonClient";
import styles from "./App.module.css";

export function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [favoriteErrors, setFavoriteErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    getFavorites()
      .then((ids) => setFavoriteIds(new Set(ids)))
      .catch(() => {
        // Badges/filter just stay empty until the next successful load —
        // the list itself still works without favorites data.
      });
  }, []);

  function clearFavoriteError(id: number) {
    setFavoriteErrors((prev) => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function toggleFavorite(id: number) {
    const wasFavorited = favoriteIds.has(id);

    // A new toggle attempt supersedes any error left over from a previous one.
    clearFavoriteError(id);

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
      setFavoriteErrors((prev) => ({ ...prev, [id]: "Couldn't save. Try again." }));
    }
  }

  return (
    <div className={styles.page}>
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
