export interface BandSearchDocument {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  formedYear: number;
  disbandedYear: number | null;
  status: string;
  genres: string[];
  countries: string[];
  createdAt: number;
  isApproved: boolean;
}
