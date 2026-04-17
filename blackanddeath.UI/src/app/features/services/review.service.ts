import { inject, Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { ReviewEndpoints } from '../../shared/constants/endpoints';
import { PaginatedResult } from '../../shared/models/paginated-result';

export interface Review {
  id: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  userRating: number | null;
  createdAt: string;
}

interface ReviewDto {
  id: string;
  userId: string;
  username: string;
  title: string;
  body: string;
  userRating: number | null;
  createdAt: string;
}

function mapReview(dto: ReviewDto): Review {
  return {
    id: dto.id,
    userId: dto.userId,
    username: dto.username,
    title: dto.title,
    body: dto.body,
    userRating: dto.userRating,
    createdAt: dto.createdAt,
  };
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(BaseHttpService);

  getAlbumReviewsCount(albumId: string) {
    return this.http.get<number>(ReviewEndpoints.GET_ALBUM_REVIEWS_COUNT(albumId)).pipe(
      catchError(() => of(0)),
    );
  }

  getBandReviewsCount(bandId: string) {
    return this.http.get<number>(ReviewEndpoints.GET_BAND_REVIEWS_COUNT(bandId)).pipe(
      catchError(() => of(0)),
    );
  }

  getAlbumReviews(albumId: string, params: { pageIndex: number; pageSize: number; orderBy?: string }) {
    return this.http.get<PaginatedResult<ReviewDto>>(
      ReviewEndpoints.GET_ALBUM_REVIEWS(albumId), params
    ).pipe(
      map(r => ({ ...r, data: (r.data ?? []).map(mapReview) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 10 })),
    );
  }

  createAlbumReview(payload: { albumId: string; userId: string; username: string; title: string; body: string; userRating: number }) {
    return this.http.post<ReviewDto>(ReviewEndpoints.CREATE_ALBUM_REVIEW, payload).pipe(
      map(mapReview),
    );
  }

  updateAlbumReview(reviewId: string, payload: { title: string; body: string; userRating: number }) {
    return this.http.put<ReviewDto>(ReviewEndpoints.UPDATE_ALBUM_REVIEW(reviewId), payload).pipe(map(mapReview));
  }

  deleteAlbumReview(reviewId: string) {
    return this.http.delete<void>(ReviewEndpoints.DELETE_ALBUM_REVIEW(reviewId));
  }

  getBandReviews(bandId: string, params: { pageIndex: number; pageSize: number; orderBy?: string }) {
    return this.http.get<PaginatedResult<ReviewDto>>(
      ReviewEndpoints.GET_BAND_REVIEWS(bandId), params
    ).pipe(
      map(r => ({ ...r, data: (r.data ?? []).map(mapReview) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 10 })),
    );
  }

  createBandReview(payload: { bandId: string; userId: string; username: string; title: string; body: string; userRating: number }) {
    return this.http.post<ReviewDto>(ReviewEndpoints.CREATE_BAND_REVIEW, payload).pipe(
      map(mapReview),
    );
  }

  updateBandReview(reviewId: string, payload: { title: string; body: string; userRating: number }) {
    return this.http.put<ReviewDto>(ReviewEndpoints.UPDATE_BAND_REVIEW(reviewId), payload).pipe(map(mapReview));
  }

  deleteBandReview(reviewId: string) {
    return this.http.delete<void>(ReviewEndpoints.DELETE_BAND_REVIEW(reviewId));
  }
}
