import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { RatingEndpoints } from '../../shared/constants/endpoints';

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

  rateBand(userId: string, bandId: string, rating: number) {
    return this.http.post<{ bandId: string; userRating: number; averageRating: number; ratingsCount: number }>(
      RatingEndpoints.RATE_BAND, { userId, bandId, rating }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating, ratingsCount: r.ratingsCount }) as AlbumRatingResult),
    );
  }
}
