import { useQuery } from "@tanstack/react-query";
import {
  getPokemonDetail,
  type PokemonDetail as PokemonDetailData,
} from "@/services/pokemonService";
import { formatName, numberLabel } from "@/lib/pokemonFormat";
import { colorForType } from "@/lib/typeColors";
import styles from "./PokemonDetail.module.css";

interface PokemonDetailProps {
  pokemonId: number | null;
  onSelect: (id: number) => void;
  favoriteIds: Set<number>;
  favoriteErrors: Record<number, string>;
  onToggleFavorite: (id: number) => void;
}

export function PokemonDetail({
  pokemonId,
  onSelect,
  favoriteIds,
  favoriteErrors,
  onToggleFavorite,
}: PokemonDetailProps) {
  const detailQuery = useQuery<PokemonDetailData>({
    queryKey: ["pokemon-detail", pokemonId],
    queryFn: () => getPokemonDetail(pokemonId as number),
    enabled: pokemonId != null,
  });

  const status = detailQuery.isPending
    ? "loading"
    : detailQuery.isError
      ? "error"
      : "ready";
  const detail = detailQuery.data ?? null;

  if (pokemonId == null) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          <div className={styles.emptyRing} />
          <div className={styles.emptyTitle}>Select a Pokémon to see details</div>
          <div className={styles.emptySubtitle}>
            Abilities, types, and evolution line will appear here.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
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
              <div style={{ flex: 1 }}>
                <div className={styles.number}>{numberLabel(detail.id)}</div>
                <div className={styles.name}>{formatName(detail.name)}</div>
              </div>
              <button
                type="button"
                className={styles.favButton}
                aria-pressed={favoriteIds.has(detail.id)}
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
              <div className={styles.sectionLabel}>Types</div>
              <div className={styles.pillRow}>
                {detail.types.map((type) => {
                  const { color, background } = colorForType(type);
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
              <div className={styles.sectionLabel}>Abilities</div>
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
              <div className={styles.sectionLabel}>Evolution line</div>
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
    </div>
  );
}
