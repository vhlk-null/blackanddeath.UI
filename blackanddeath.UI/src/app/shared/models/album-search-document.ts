export interface AlbumSearchBand {
  id: string;
  name: string;
  slug: string;
}

export interface AlbumSearchDocument {
  id: string;
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number;
  type: string;
  format: string;
  bands: AlbumSearchBand[] | string[];
  genres: string[];
  tags: string[];
  countries: { name: string; code: string }[] | string[];
  createdAt: number;
  averageRating?: number | null;
  ratingsCount?: number;
}
