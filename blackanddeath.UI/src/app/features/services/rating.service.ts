import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { RatingEndpoints } from '../../shared/constants/endpoints';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { PaginatedResult } from '../../shared/models/paginated-result';

interface TopRatedAlbumDto {
  id: string;
  title: string;
  slug: string | null;
  coverUrl: string | null;
  releaseDate: number;
  format: number;
  type: number;
  primaryGenreName: string | null;
  primaryGenreSlug: string | null;
  bandNames: string | null;
  bandSlugs: string | null;
  countryNames: string | null;
  averageRating: number | null;
  ratingsCount: number;
  isExplicit?: boolean;
}

function mapTopRatedAlbum(dto: TopRatedAlbumDto): Album {
  return {
    id: dto.id,
    title: dto.title,
    slug: dto.slug ?? '',
    coverUrl: dto.coverUrl,
    releaseDate: dto.releaseDate,
    format: dto.format as any,
    type: dto.type as any,
    videos: [],
    averageRating: dto.averageRating,
    ratingsCount: dto.ratingsCount,
    isExplicit: dto.isExplicit,
    primaryGenre: dto.primaryGenreName ? { id: '', name: dto.primaryGenreName, slug: dto.primaryGenreSlug ?? '' } : null,
    bands: dto.bandNames ? [{ id: '', name: dto.bandNames, slug: dto.bandSlugs ?? '' }] : [],
    countries: dto.countryNames ? [{ id: '', name: dto.countryNames, code: '' }] : [],
  };
}

interface TopRatedBandDto {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  formedYear: number;
  disbandedYear: number | null;
  status: number;
  primaryGenreName: string | null;
  primaryGenreSlug: string | null;
  countryNames: string | null;
  countryCodes: string | null;
  averageRating: number | null;
  ratingsCount: number;
}

function mapTopRatedBand(dto: TopRatedBandDto): Band {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    logoUrl: dto.logoUrl,
    formedYear: dto.formedYear,
    disbandedYear: dto.disbandedYear,
    averageRating: dto.averageRating,
    ratingsCount: dto.ratingsCount,
    primaryGenre: dto.primaryGenreName ? { id: '', name: dto.primaryGenreName, slug: dto.primaryGenreSlug ?? '' } : null,
    countries: dto.countryNames ? [{ id: '', name: dto.countryNames, code: dto.countryCodes ?? '' }] : [],
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
      RatingEndpoints.RATE_ALBUM, { userId, albumId, rating }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
    );
  }

  getTopRatedAlbums(params: { period?: string; pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<TopRatedAlbumDto>>(RatingEndpoints.TOP_RATED_ALBUMS, params).pipe(
      map(r => (r.data ?? []).map(mapTopRatedAlbum)),
      catchError(() => of([])),
    );
  }

  getTopRatedBands(params: { period?: string; pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<TopRatedBandDto>>(RatingEndpoints.TOP_RATED_BANDS, params).pipe(
      map(r => (r.data ?? []).map(mapTopRatedBand)),
      catchError(() => of([])),
    );
  }

  rateBand(userId: string, bandId: string, rating: number) {
    return this.http.post<{ bandId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.RATE_BAND, { userId, bandId, rating }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
    );
  }
}
