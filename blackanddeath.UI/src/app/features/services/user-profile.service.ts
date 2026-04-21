import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { UserProfileEndpoints } from '../../shared/constants/endpoints';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { CollectionSummary } from './collection.service';

export interface UserProfileFavoriteAlbumDto {
  albumId: string;
  albumTitle: string;
  slug: string | null;
  coverUrl: string | null;
  releaseDate: number;
  releaseMonth?: number | null;
  releaseDay?: number | null;
  albumType: string | null;
  bandName: string | null;
  bandSlug: string | null;
  addedDate: string;
  userReview: string | null;
}

export interface UserProfileFavoriteBandDto {
  bandId: string;
  bandName: string;
  slug: string | null;
  logoUrl: string | null;
  formedYear: number;
  primaryGenreName: string | null;
  countryNames: string | null;
  addedDate: string;
  isFollowing: boolean;
}

export interface UserProfileCollectionDto {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  coverUrl?: string | null;
  createdAt: string;
  count: number;
  type: 0 | 1 | 'Albums' | 'Bands';
  albums?: { id: string }[];
  bands?: { id: string }[];
}

export interface UserProfileDto {
  userId: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  registeredDate: string;
  lastLoginDate: string;
  bio: string | null;
  favoriteBandsCount: number;
  favoriteAlbumsCount: number;
  reviewsCount: number;
  favoriteAlbums: UserProfileFavoriteAlbumDto[];
  favoriteBands: UserProfileFavoriteBandDto[];
  collections: UserProfileCollectionDto[];
}

export function mapProfileAlbum(dto: UserProfileFavoriteAlbumDto): Album {
  const bandNames = dto.bandName?.split(',').map(s => s.trim()) ?? [];
  const bandSlugs = dto.bandSlug?.split(',').map(s => s.trim()) ?? [];
  return {
    id: dto.albumId,
    title: dto.albumTitle,
    slug: dto.slug ?? dto.albumId,
    coverUrl: dto.coverUrl,
    releaseDate: dto.releaseDate,
    format: null as any,
    type: dto.albumType as any,
    videos: [],
    bands: bandNames.map((name, i) => ({ id: '', name, slug: bandSlugs[i] ?? '' })),
  };
}

export function mapProfileBand(dto: UserProfileFavoriteBandDto): Band {
  return {
    id: dto.bandId,
    name: dto.bandName,
    slug: dto.slug ?? dto.bandId,
    logoUrl: dto.logoUrl,
    formedYear: dto.formedYear,
    primaryGenre: dto.primaryGenreName ? { id: '', name: dto.primaryGenreName, slug: '' } : null,
    countries: dto.countryNames ? [{ id: '', name: dto.countryNames, code: '' }] : [],
  };
}

export function mapProfileCollection(dto: UserProfileCollectionDto): CollectionSummary {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    coverUrl: dto.coverUrl ?? null,
    createdAt: dto.createdAt,
    albumCount: (dto.type === 0 || dto.type === 'Albums') ? dto.count : 0,
    bandCount: (dto.type === 1 || dto.type === 'Bands') ? dto.count : 0,
    collectionType: (dto.type === 0 || dto.type === 'Albums') ? 'album' : 'band',
    albums: dto.albums ?? [],
    bands: dto.bands ?? [],
  };
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private http = inject(BaseHttpService);

  getProfile(userId: string): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(UserProfileEndpoints.GET_PROFILE(userId));
  }
}
