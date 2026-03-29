import { Album } from './album';

export interface BandSummary {
  id: string | null;
  name: string;
  slug: string;
  discography?: Album[];
}
