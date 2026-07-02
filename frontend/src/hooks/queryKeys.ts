export const pokemonKeys = {
  all: ["pokemon"] as const,
  list: () => [...pokemonKeys.all, "list"] as const,
  detail: (id: number) => [...pokemonKeys.all, "detail", id] as const,
};

export const favoriteKeys = {
  all: ["favorites"] as const,
  toggleMutation: ["favorites", "toggle"] as const,
};
