/** Flat display model used in cards and seed data */
export interface AlbumSummary {
  id: number | string;
  title: string;
  band: string;
  type: string;
  year: number;
  country: string;
  genre: string;
  coverImage: string | null;
  label?: string | null;
}
