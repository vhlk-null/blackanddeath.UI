import { Country } from './country';
import { Genre } from './genre';
import { AlbumType } from './enums/album-type.enum';
import { AlbumFormat } from './enums/album-format.enum';
import { VideoBand } from './video-band';

export interface BandGenre {
  id: string;
  name: string;
  slug: string;
  isPrimary: boolean;
}

export interface BandAlbum {
  id: string;
  slug: string;
  title: string;
  releaseDate: number;
  coverUrl: string | null;
  type: AlbumType;
  format: AlbumFormat;
  genres?: { id: string; name: string; slug: string; isPrimary: boolean }[];
  countries?: { id: string; name: string; code: string }[];
  bandId?: string;
  bandName?: string;
}

export interface Band {
  id: string;
  slug: string;
  logoUrl: string | null;
  name: string;
  bio?: string | null;
  formedYear: number;
  disbandedYear?: number | null;
  status?: string | null;
  city?: string | null;
  label?: string | null;
  countries?: Country[];
  genres?: BandGenre[];
  primaryGenre?: Genre | null;
  parentGenre?: Genre | null;
  subgenres?: Genre[];
  albums?: BandAlbum[];
  similarAlbums?: BandAlbum[];
  similarBands?: { id: string; slug: string; name: string; logoUrl: string | null }[];
  videos?: VideoBand[];
}
