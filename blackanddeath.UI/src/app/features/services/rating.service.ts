import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { AlbumEndpoints, BandEndpoints, RatingEndpoints } from '../../shared/constants/endpoints';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { PaginatedResult } from '../../shared/models/paginated-result';

interface AlbumCardDto {
  id: string;
  title: string;
  slug: string;
  coverUrl: string | null;
  releaseYear: number;
  format: string;
  type: string;
  bands: string[];
  genres: string[];
  countries: string[];
  tags: string[];
  averageRating: number | null;
  ratingsCount: number;
  isExplicit?: boolean;
}

function mapAlbumCard(dto: AlbumCardDto): Album {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug,
    coverUrl: dto.coverUrl,
    releaseDate: dto.releaseYear,
    format: dto.format as any,
    type: dto.type as any,
    videos: [],
    averageRating: dto.averageRating,
    ratingsCount: dto.ratingsCount,
    isExplicit: dto.isExplicit,
    bands: dto.bands.map(name => ({ id: '', name, slug: '' })),
    genres: dto.genres.map(name => ({ id: '', name })),
    countries: dto.countries.map(name => ({ id: '', name, code: '' })),
  };
}

interface BandCardDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  formedYear: number;
  disbandedYear: number | null;
  status: string;
  genres: string[];
  countries: string[];
  averageRating: number | null;
  ratingsCount: number;
}

function mapBandCard(dto: BandCardDto): Band {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logoUrl: dto.logoUrl,
    formedYear: dto.formedYear,
    disbandedYear: dto.disbandedYear,
    averageRating: dto.averageRating,
    ratingsCount: dto.ratingsCount,
    genres: dto.genres.map(name => ({ id: '', name, slug: '', isPrimary: false })),
    countries: dto.countries.map(name => ({ id: '', name, code: '' })),
  };
}

export interface AlbumRatingResult {
  userRating: number;
  averageRating: number;
  ratingsCount: number;
}

export interface AverageRatingResult {
  averageRating: number;
  ratingsCount: number;
}

@Injectable({ providedIn: 'root' })
export class RatingService {
  private http = inject(BaseHttpService);

  getAlbumAverage(albumId: string) {
    return this.http.get<{ albumId: string; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.GET_ALBUM_AVERAGE(albumId)
    ).pipe(
      map(r => ({ averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AverageRatingResult),
      catchError(() => of(null)),
    );
  }

  getBandAverage(bandId: string) {
    return this.http.get<{ bandId: string; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.GET_BAND_AVERAGE(bandId)
    ).pipe(
      map(r => ({ averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AverageRatingResult),
      catchError(() => of(null)),
    );
  }

  getUserAlbumRating(albumId: string, userId: string) {
    return this.http.get<{ albumId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.GET_ALBUM_RATING(albumId), { userId }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
      catchError(() => of(null)),
    );
  }

  getUserBandRating(bandId: string, userId: string) {
    return this.http.get<{ bandId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.GET_BAND_RATING(bandId), { userId }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
      catchError(() => of(null)),
    );
  }

  rateAlbum(userId: string, albumId: string, rating: number) {
    return this.http.post<{ albumId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.RATE_ALBUM(albumId), { userId, rating }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
    );
  }

  getTopRatedAlbums(params: { period?: string; pageIndex: number; pageSize: number; sortDir?: string }) {
    return this.http.get<{ albums: PaginatedResult<AlbumCardDto> }>(AlbumEndpoints.TOP_RATED, params, true).pipe(
      map(r => ({ data: (r.albums?.data ?? []).map(mapAlbumCard), count: r.albums?.count ?? 0 })),
      catchError(() => of({ data: [], count: 0 })),
    );
  }

  getTopRatedBands(params: { period?: string; pageIndex: number; pageSize: number; sortDir?: string }) {
    return this.http.get<{ bands: PaginatedResult<BandCardDto> }>(BandEndpoints.TOP_RATED, params, true).pipe(
      map(r => ({ data: (r.bands?.data ?? []).map(mapBandCard), count: r.bands?.count ?? 0 })),
      catchError(() => of({ data: [], count: 0 })),
    );
  }

  rateBand(userId: string, bandId: string, rating: number) {
    return this.http.post<{ bandId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.RATE_BAND(bandId), { userId, rating }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
    );
  }
}
