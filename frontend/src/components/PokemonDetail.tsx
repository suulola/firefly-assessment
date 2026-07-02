import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { formatName, numberLabel } from "@/lib/pokemonFormat";
import { colorForType } from "@/lib/typeColors";
import styles from "./PokemonDetail.module.scss";

interface PokemonDetailProps {
  pokemonId: number | null;
  onSelect: (id: number) => void;
  onBack: () => void;
  favoriteIds: Set<number>;
  favoriteErrors: Record<number, string>;
  onToggleFavorite: (id: number) => void;
  isFavoritePending: (id: number) => boolean;
}

export function PokemonDetail({
  pokemonId,
  onSelect,
  onBack,
  favoriteIds,
  favoriteErrors,
  onToggleFavorite,
  isFavoritePending,
}: PokemonDetailProps) {
  const detailQuery = usePokemonDetail(pokemonId);

  const status = detailQuery.isPending
    ? "loading"
    : detailQuery.isError
      ? "error"
      : "ready";
  const detail = detailQuery.data ?? null;

  if (pokemonId == null) {
    return (
      <main className={styles.panel} aria-label="Pokémon detail">
        <div className={styles.empty}>
          <div className={styles.emptyRing} />
          <div className={styles.emptyTitle}>Select a Pokémon to see details</div>
          <div className={styles.emptySubtitle}>
            Abilities, types, and evolution line will appear here.
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.panel} aria-label="Pokémon detail">
      <button type="button" className={styles.backButton} onClick={onBack}>
        ← Back to list
      </button>
      <div className={styles.content}>
        {status === "loading" && (
          <div role="status" aria-label="Loading Pokémon detail">
            <div className={styles.skeletonHeader}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonNumber} />
              </div>
            </div>
            <div className={styles.skeletonBlock} />
          </div>
        )}

        {status === "error" && (
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>⚠</div>
            <div className={styles.errorTitle}>Couldn't load this Pokémon</div>
            <div className={styles.errorMessage}>
              Something went wrong loading this Pokémon.
            </div>
            <button className={styles.retryButton} onClick={() => detailQuery.refetch()}>
              Retry
            </button>
          </div>
        )}

        {status === "ready" && detail && (
          <div key={detail.id} className={styles.readyContent}>
            <div className={styles.header}>
              <div className={styles.avatar}>
                <img
                  className={styles.sprite}
                  src={detail.spriteUrl}
                  alt={formatName(detail.name)}
                />
              </div>
              <div className={styles.identity}>
                <div className={styles.number}>{numberLabel(detail.id)}</div>
                <h2 className={styles.name}>{formatName(detail.name)}</h2>
              </div>
              <button
                type="button"
                className={styles.favButton}
                aria-pressed={favoriteIds.has(detail.id)}
                aria-busy={isFavoritePending(detail.id)}
                disabled={isFavoritePending(detail.id)}
                onClick={() => onToggleFavorite(detail.id)}
              >
                <span
                  key={favoriteIds.has(detail.id) ? "fav" : "unfav"}
                  className={styles.favIcon}
                >
                  {favoriteIds.has(detail.id) ? "★" : "☆"}
                </span>
                <span>
                  {favoriteIds.has(detail.id) ? "Favorited" : "Add to favorites"}
                </span>
              </button>
            </div>
            {favoriteErrors[detail.id] && (
              <div role="alert" className={styles.favError}>
                {favoriteErrors[detail.id]}
              </div>
            )}

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Types</h3>
              <div className={styles.pillRow}>
                {detail.types.map((type) => {
                  const { color, background } = colorForType(type);
                  // Genuinely per-instance dynamic (colorForType has no
                  // fixed, enumerable set of CSS variants — every Pokémon
                  // type gets its own color) — a CSS custom property would
                  // only trade this inline style for an `as React.CSSProperties`
                  // cast to smuggle "--type-color" past CSSProperties' typing,
                  // without removing the dynamism. Kept inline; see CLAUDE.md.
                  return (
                    <span
                      key={type}
                      className={styles.typePill}
                      style={{ color, background }}
                    >
                      {formatName(type)}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Abilities</h3>
              <div className={styles.pillRow}>
                {detail.abilities.map((ability) => (
                  <span key={ability.name} className={styles.abilityPill}>
                    {formatName(ability.name)}
                    {ability.hidden && (
                      <span className={styles.hiddenBadge}>hidden</span>
                    )}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionLabel}>Evolution line</h3>
              {detail.evolutions.length > 1 ? (
                <div className={styles.evoRow}>
                  {detail.evolutions.map((stage, idx) => (
                    <div className={styles.evoStep} key={stage.id}>
                      <button
                        type="button"
                        className={`${styles.evoButton} ${
                          stage.id === detail.id ? styles.evoButtonCurrent : ""
                        }`}
                        onClick={() => onSelect(stage.id)}
                      >
                        <div className={styles.evoAvatar}>
                          <img
                            className={styles.evoSprite}
                            src={stage.spriteUrl}
                            alt={formatName(stage.name)}
                          />
                        </div>
                        <div className={styles.evoName}>{formatName(stage.name)}</div>
                      </button>
                      {idx < detail.evolutions.length - 1 && (
                        <span className={styles.evoArrow}>→</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noEvolutions}>
                  This Pokémon has no evolutions.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
