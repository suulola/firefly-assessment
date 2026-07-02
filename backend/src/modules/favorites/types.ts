export interface FavoritesStore {
  read(): Promise<number[]>;
  write(favoriteIds: number[]): Promise<void>;
}
