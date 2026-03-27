import { AlbumType } from './enums/album-type.enum';
import { AlbumFormat } from './enums/album-format.enum';
import { BandSummary } from './band-summary';
import { Country } from './country';
import { Genre } from './genre';
import { StreamingLink } from './streaming-link';
import { ApiTrack } from './track';
import { Label } from './label';

export interface Album {
  id: string;
  slug: string;
  title: string;
  releaseDate: number;
  coverUrl: string | null;
  type: AlbumType;
  format: AlbumFormat;
  label?: Label | null;
  bands?: BandSummary[];
  countries?: Country[];
  streamingLinks?: StreamingLink[];
  tracks?: ApiTrack[];
  genres?: Genre[];
}
