import { useEffect, useState } from "react";
import { getPokemonList, type PokemonListItem } from "../lib/pokemonClient";
import { formatName, numberLabel } from "../lib/pokemonFormat";
import styles from "./PokemonList.module.css";

type Status = "loading" | "ready" | "error";

const SKELETON_ROWS = Array.from({ length: 9 }, (_, i) => i);

interface PokemonListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  favoriteIds: Set<number>;
  onToggleFavorite: (id: number) => void;
}

export function PokemonList({
  selectedId,
  onSelect,
  favoriteIds,
  onToggleFavorite,
}: PokemonListProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [items, setItems] = useState<PokemonListItem[]>([]);

  function load() {
    setStatus("loading");
    getPokemonList()
      .then((list) => {
        setItems(list);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(load, []);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h1 className={styles.title}>Pokémon Explorer</h1>
        <div className={styles.subtitle}>
          {status === "ready" ? `${items.length} Pokémon` : " "}
        </div>
      </div>

      <div className={styles.scrollArea}>
        {status === "loading" && (
          <div role="status">
            <span className={styles.visuallyHidden}>Loading Pokémon…</span>
            {SKELETON_ROWS.map((row) => (
              <div className={styles.skeletonRow} key={row}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLines}>
                  <div className={styles.skeletonLine} style={{ width: "70%" }} />
                  <div className={styles.skeletonLine} style={{ width: "35%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === "error" && (
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>⚠</div>
            <div className={styles.errorTitle}>Couldn't load Pokémon</div>
            <div className={styles.errorMessage}>
              Something went wrong loading the list.
            </div>
            <button className={styles.retryButton} onClick={load}>
              Retry
            </button>
          </div>
        )}

        {status === "ready" && (
          <ul className={styles.list}>
            {items.map((item) => {
              const displayName = formatName(item.name);
              const selected = item.id === selectedId;
              const isFavorited = favoriteIds.has(item.id);
              return (
                <li key={item.id}>
                  <div className={`${styles.row} ${selected ? styles.rowSelected : ""}`}>
                    <button
                      type="button"
                      className={styles.selectButton}
                      aria-pressed={selected}
                      onClick={() => onSelect(item.id)}
                    >
                      <div className={styles.avatar}>
                        <img
                          className={styles.sprite}
                          src={item.spriteUrl}
                          alt={displayName}
                          loading="lazy"
                        />
                      </div>
                      <div className={styles.info}>
                        <div className={styles.name}>{displayName}</div>
                        <div className={styles.number}>{numberLabel(item.id)}</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      className={styles.favButton}
                      aria-label={`Toggle favorite for ${displayName}`}
                      aria-pressed={isFavorited}
                      onClick={() => onToggleFavorite(item.id)}
                    >
                      {isFavorited ? "★" : "☆"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
