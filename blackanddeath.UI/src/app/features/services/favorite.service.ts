import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { FavoriteEndpoints } from '../../shared/constants/endpoints';
import { PaginatedResult } from '../../shared/models/paginated-result';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { VideoBand } from '../../shared/models/video-band';
import { VideoType } from '../../shared/models/enums/video-type.enum';

export interface FavoriteAlbumDto {
  albumId: string;
  title: string;
  slug: string | null;
  coverUrl: string | null;
  releaseDate: number;
  releaseMonth?: number | null;
  releaseDay?: number | null;
  format: number;
  type: number;
  primaryGenreName: string | null;
  primaryGenreSlug: string | null;
  bandNames: string | null;
  bandSlugs: string | null;
  countryNames: string | null;
  addedDate: string;
}

function mapFavoriteAlbum(dto: FavoriteAlbumDto): Album {
  return {
    id: dto.albumId,
    title: dto.title,
    slug: dto.slug ?? '',
    coverUrl: dto.coverUrl,
    releaseDate: dto.releaseDate,
    format: dto.format as any,
    type: dto.type as any,
    videos: [],
    primaryGenre: dto.primaryGenreName ? { id: '', name: dto.primaryGenreName, slug: dto.primaryGenreSlug ?? '' } : null,
    bands: dto.bandNames ? [{ id: '', name: dto.bandNames, slug: dto.bandSlugs ?? '' }] : [],
    countries: dto.countryNames ? [{ id: '', name: dto.countryNames, code: '' }] : [],
  };
}

export interface FavoriteBandDto {
  bandId: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  formedYear: number;
  primaryGenreName: string | null;
  primaryGenreSlug: string | null;
  countryNames: string | null;
  addedDate: string;
}

export interface FavoriteVideoDto {
  videoId: string;
  name: string;
  youtubeLink: string;
  videoType: VideoType;
  year: number;
  bandId: string;
  bandName: string | null;
  addedDate: string;
}

function mapFavoriteVideo(dto: FavoriteVideoDto): VideoBand {
  return {
    id: dto.videoId,
    name: dto.name,
    youtubeLink: dto.youtubeLink,
    videoType: dto.videoType,
    year: dto.year,
    bandId: dto.bandId,
    bandName: dto.bandName ?? undefined,
  };
}

function mapFavoriteBand(dto: FavoriteBandDto): Band {
  return {
    id: dto.bandId,
    name: dto.name,
    slug: dto.slug ?? '',
    logoUrl: dto.logoUrl,
    formedYear: dto.formedYear,
    primaryGenre: dto.primaryGenreName ? { id: '', name: dto.primaryGenreName, slug: dto.primaryGenreSlug ?? '' } : null,
    countries: dto.countryNames ? [{ id: '', name: dto.countryNames, code: '' }] : [],
  };
}

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(BaseHttpService);

  getFavoriteAlbums(userId: string, params: { pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<FavoriteAlbumDto>>(
      FavoriteEndpoints.GET_FAVORITE_ALBUMS(userId), params
    ).pipe(map(r => ({ ...r, data: (r.data ?? []).map(mapFavoriteAlbum) })));
  }

  checkFavoriteAlbum(albumId: string, userId: string) {
    return this.http.get<boolean>(FavoriteEndpoints.CHECK_FAVORITE_ALBUM, { userId, albumId });
  }

  checkFavoriteBand(bandId: string, userId: string) {
    return this.http.get<boolean>(FavoriteEndpoints.CHECK_FAVORITE_BAND, { userId, bandId });
  }

  addFavoriteAlbum(albumId: string, userId: string) {
    return this.http.post<void>(FavoriteEndpoints.FAVORITE_ALBUMS, { albumId, userId });
  }

  removeFavoriteAlbum(albumId: string, userId: string) {
    return this.http.delete<void>(FavoriteEndpoints.DELETE_FAVORITE_ALBUM(albumId, userId));
  }

  getFavoriteBands(userId: string, params: { pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<FavoriteBandDto>>(
      FavoriteEndpoints.GET_FAVORITE_BANDS(userId), params
    ).pipe(map(r => ({ ...r, data: (r.data ?? []).map(mapFavoriteBand) })));
  }

  addFavoriteBand(bandId: string, userId: string) {
    return this.http.post<void>(FavoriteEndpoints.FAVORITE_BANDS, { bandId, userId });
  }

  removeFavoriteBand(bandId: string, userId: string) {
    return this.http.delete<void>(FavoriteEndpoints.DELETE_FAVORITE_BAND(bandId, userId));
  }

  getFavoriteVideos(userId: string, params: { pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<FavoriteVideoDto>>(
      FavoriteEndpoints.GET_FAVORITE_VIDEOS(userId), params
    ).pipe(map(r => ({ ...r, data: (r.data ?? []).map(mapFavoriteVideo) })));
  }

  checkFavoriteVideo(videoId: string, userId: string) {
    return this.http.get<boolean>(FavoriteEndpoints.CHECK_FAVORITE_VIDEO, { userId, videoId });
  }

  addFavoriteVideo(videoId: string, userId: string) {
    return this.http.post<void>(FavoriteEndpoints.FAVORITE_VIDEOS, { videoId, userId });
  }

  removeFavoriteVideo(videoId: string, userId: string) {
    return this.http.delete<void>(FavoriteEndpoints.DELETE_FAVORITE_VIDEO(videoId, userId));
  }
}
