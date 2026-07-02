import { useState } from "react";
import { PokemonList } from "./components/PokemonList";
import { PokemonDetail } from "./components/PokemonDetail";
import styles from "./App.module.css";

export function App() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <div className={styles.page}>
      <PokemonList selectedId={selectedId} onSelect={setSelectedId} />
      <PokemonDetail pokemonId={selectedId} onSelect={setSelectedId} />
    </div>
  );
}
