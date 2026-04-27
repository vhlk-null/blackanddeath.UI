export interface AlbumSearchDocument {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number;
  type: string;
  format: string;
  bands: string[];
  genres: string[];
  tags: string[];
  countries: string[];
  createdAt: number;
}
