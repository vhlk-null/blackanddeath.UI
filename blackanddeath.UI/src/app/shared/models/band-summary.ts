import { Album } from './album';
import { VideoBand } from './video-band';

export interface BandSummary {
  id: string | null;
  name: string;
  slug: string;
  discography?: Album[];
  videos?: VideoBand[];
}
