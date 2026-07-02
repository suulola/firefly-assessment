import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePokemonListView } from "@/hooks/usePokemonListView";
import { formatName, numberLabel } from "@/lib/pokemonFormat";
import styles from "./PokemonList.module.scss";

const SKELETON_ROWS = Array.from({ length: 9 }, (_, i) => i);
const LOAD_MORE_THRESHOLD_PX = 200;
// Matches the row's rendered height (44px avatar + 9px top/bottom padding +
// 1px border). Used as both the virtualizer's size estimate and its jsdom
// fallback (see the `measureElement` override below) — real browsers still
// remeasure dynamically, this is just what's assumed until then.
const ROW_HEIGHT_PX = 63;

interface PokemonListProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  favoriteIds: Set<number>;
  favoriteErrors: Record<number, string>;
  onToggleFavorite: (id: number) => void;
  isFavoritePending: (id: number) => boolean;
}

export function PokemonList({
  selectedId,
  onSelect,
  favoriteIds,
  favoriteErrors,
  onToggleFavorite,
  isFavoritePending,
}: PokemonListProps) {
  const {
    items,
    status,
    total,
    isFetchingNextPage,
    favoritesOnly,
    toggleFavoritesOnly,
    searchQuery,
    setSearchQuery,
    onScrollNearBottom,
    refetch,
  } = usePokemonListView(favoriteIds);

  const isSearching = searchQuery.trim() !== "";

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollAreaRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 6,
    // jsdom (tests) reports 0 for getBoundingClientRect() — fall back to the
    // estimate rather than collapsing every row to zero height there.
    measureElement: (el) => el.getBoundingClientRect().height || ROW_HEIGHT_PX,
  });

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const nearBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - LOAD_MORE_THRESHOLD_PX;
    if (nearBottom) {
      onScrollNearBottom();
    }
  }

  return (
    <nav className={styles.panel} aria-label="Pokémon list">
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Pokémon Explorer</h1>
          <div className={styles.subtitle}>
            {status === "ready"
              ? `${total} Pokémon · ${favoriteIds.size} favorited`
              : " "}
          </div>
        </div>
        {status === "ready" && (isSearching || favoritesOnly) && (
          <span role="status" className={styles.visuallyHidden}>
            {items.length} {items.length === 1 ? "result" : "results"}
          </span>
        )}
        <input
          type="search"
          className={styles.searchInput}
          role="searchbox"
          aria-label="Search Pokémon"
          placeholder="Search Pokémon…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          type="button"
          className={styles.favoritesToggle}
          aria-pressed={favoritesOnly}
          onClick={toggleFavoritesOnly}
        >
          <span>Favorites only</span>
          <span className={styles.toggleTrack} data-checked={favoritesOnly}>
            <span className={styles.toggleKnob} data-checked={favoritesOnly} />
          </span>
        </button>
      </header>

      <div
        ref={scrollAreaRef}
        className={styles.scrollArea}
        data-testid="pokemon-scroll-area"
        onScroll={handleScroll}
      >
        {status === "loading" && (
          <div role="status">
            <span className={styles.visuallyHidden}>Loading Pokémon…</span>
            {SKELETON_ROWS.map((row) => (
              <div className={styles.skeletonRow} key={row}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonLines}>
                  <div className={`${styles.skeletonLine} ${styles.skeletonLinePrimary}`} />
                  <div className={`${styles.skeletonLine} ${styles.skeletonLineSecondary}`} />
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
            <button className={styles.retryButton} onClick={refetch}>
              Retry
            </button>
          </div>
        )}

        {status === "ready" && items.length === 0 && favoritesOnly && !isSearching && (
          <div className={styles.emptyFavorites}>
            <div className={styles.emptyFavoritesIcon}>☆</div>
            <div className={styles.emptyFavoritesTitle}>No favorites yet</div>
            <div className={styles.emptyFavoritesSubtitle}>
              Star a Pokémon to add it here.
            </div>
          </div>
        )}

        {status === "ready" &&
          items.length === 0 &&
          isSearching &&
          !isFetchingNextPage && (
          <div className={styles.emptyFavorites}>
            <div className={styles.emptyFavoritesIcon}>🔍</div>
            <div className={styles.emptyFavoritesTitle}>No Pokémon found</div>
            <div className={styles.emptyFavoritesSubtitle}>Try a different search.</div>
          </div>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className={styles.list} style={{ height: rowVirtualizer.getTotalSize() }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = items[virtualRow.index];
              const displayName = formatName(item.name);
              const selected = item.id === selectedId;
              const isFavorited = favoriteIds.has(item.id);
              return (
                <li
                  key={item.id}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className={styles.virtualRow}
                  style={{ transform: `translateY(${virtualRow.start}px)` }}
                >
                  <div className={`${styles.row} ${selected ? styles.rowSelected : ""}`}>
                    <button
                      type="button"
                      className={styles.selectButton}
                      aria-current={selected ? "true" : undefined}
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
                      aria-busy={isFavoritePending(item.id)}
                      disabled={isFavoritePending(item.id)}
                      onClick={() => onToggleFavorite(item.id)}
                    >
                      <span key={isFavorited ? "fav" : "unfav"} className={styles.favIcon}>
                        {isFavorited ? "★" : "☆"}
                      </span>
                    </button>
                  </div>
                  {favoriteErrors[item.id] && (
                    <div role="alert" className={styles.favError}>
                      {favoriteErrors[item.id]}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {status === "ready" && isFetchingNextPage && (
          <div className={styles.loadMoreStatus} role="status">
            Loading more Pokémon…
          </div>
        )}
      </div>
    </nav>
  );
}
