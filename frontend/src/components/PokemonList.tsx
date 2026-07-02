import { useEffect, useState } from "react";
import { getPokemonList, type PokemonListItem } from "../lib/pokemonClient";
import styles from "./PokemonList.module.css";

type Status = "loading" | "ready" | "error";

function formatName(name: string): string {
  return name
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function numberLabel(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

const SKELETON_ROWS = Array.from({ length: 9 }, (_, i) => i);

export function PokemonList() {
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
          {status === "ready" ? `${items.length} Pokémon` : " "}
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
              return (
                <li className={styles.row} key={item.id}>
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
