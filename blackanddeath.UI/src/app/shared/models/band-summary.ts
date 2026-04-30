import { Album } from './album';
import { VideoBand } from './video-band';

export interface DiscographyGroup {
  bandId: string | null;
  bandName: string | null;
  bandSlug: string | null;
  label: string;
  albums: Album[];
}

export interface BandSummary {
  id: string | null;
  name: string;
  slug: string;
  status?: string;
  isApproved?: boolean;
  discography?: Album[];
  videos?: VideoBand[];
}
