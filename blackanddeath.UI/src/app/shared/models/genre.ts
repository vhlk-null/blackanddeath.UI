export interface Genre {
  id: string;
  name: string;
  slug?: string;
  parentGenreId?: string | null;
  isPrimary?: boolean;
}
