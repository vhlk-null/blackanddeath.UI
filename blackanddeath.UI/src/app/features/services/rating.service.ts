import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { RatingEndpoints } from '../../shared/constants/endpoints';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private http = inject(BaseHttpService);

  getUserAlbumRating(albumId: string, userId: string) {
    return this.http.get<{ albumId: string; userRating: number; averageRating: number }>(
      RatingEndpoints.GET_ALBUM_RATING(albumId), { userId }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating })),
      catchError(() => of(null)),
    );
  }

  getUserBandRating(bandId: string, userId: string) {
    return this.http.get<{ bandId: string; userRating: number; averageRating: number }>(
      RatingEndpoints.GET_BAND_RATING(bandId), { userId }
    ).pipe(
      map(r => ({ userRating: r.userRating, averageRating: r.averageRating })),
      catchError(() => of(null)),
    );
  }

  getAlbumAverage(albumId: string) {
    return this.http.get<{ albumId: string; averageRating: number }>(
      RatingEndpoints.GET_ALBUM_AVERAGE(albumId)
    ).pipe(
      map(r => r.averageRating),
      catchError(() => of(null)),
    );
  }

  getBandAverage(bandId: string) {
    return this.http.get<{ bandId: string; averageRating: number }>(
      RatingEndpoints.GET_BAND_AVERAGE(bandId)
    ).pipe(
      map(r => r.averageRating),
      catchError(() => of(null)),
    );
  }

  rateAlbum(userId: string, albumId: string, rating: number) {
    return this.http.post<void>(RatingEndpoints.RATE_ALBUM, { userId, albumId, rating });
  }

  rateBand(userId: string, bandId: string, rating: number) {
    return this.http.post<void>(RatingEndpoints.RATE_BAND, { userId, bandId, rating });
  }
}
