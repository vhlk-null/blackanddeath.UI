import { inject, Injectable } from '@angular/core';
import { map, catchError, of } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { CommentEndpoints } from '../../shared/constants/endpoints';
import { PaginatedResult } from '../../shared/models/paginated-result';

export interface Comment {
  id: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
  parentCommentId: string | null;
  replies: Comment[];
}

interface CommentDto {
  id: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
  parentCommentId: string | null;
  replies: CommentDto[];
}

function mapComment(dto: CommentDto): Comment {
  return {
    id: dto.id,
    userId: dto.userId,
    username: dto.username,
    body: dto.body,
    createdAt: dto.createdAt,
    parentCommentId: dto.parentCommentId,
    replies: (dto.replies ?? []).map(mapComment),
  };
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(BaseHttpService);

  getAlbumComments(albumId: string, params: { pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<CommentDto>>(
      CommentEndpoints.GET_ALBUM_COMMENTS(albumId), params
    ).pipe(
      map(r => ({ ...r, data: (r.data ?? []).map(mapComment) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 20 })),
    );
  }

  createAlbumComment(payload: { albumId: string; userId: string; username: string; body: string; parentCommentId?: string | null }) {
    return this.http.post<CommentDto>(CommentEndpoints.CREATE_ALBUM_COMMENT, payload).pipe(map(mapComment));
  }

  updateAlbumComment(commentId: string, payload: { body: string }) {
    return this.http.put<CommentDto>(CommentEndpoints.UPDATE_ALBUM_COMMENT(commentId), payload).pipe(map(mapComment));
  }

  deleteAlbumComment(commentId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_ALBUM_COMMENT(commentId));
  }

  getBandComments(bandId: string, params: { pageIndex: number; pageSize: number }) {
    return this.http.get<PaginatedResult<CommentDto>>(
      CommentEndpoints.GET_BAND_COMMENTS(bandId), params
    ).pipe(
      map(r => ({ ...r, data: (r.data ?? []).map(mapComment) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 20 })),
    );
  }

  createBandComment(payload: { bandId: string; userId: string; username: string; body: string; parentCommentId?: string | null }) {
    return this.http.post<CommentDto>(CommentEndpoints.CREATE_BAND_COMMENT, payload).pipe(map(mapComment));
  }

  updateBandComment(commentId: string, payload: { body: string }) {
    return this.http.put<CommentDto>(CommentEndpoints.UPDATE_BAND_COMMENT(commentId), payload).pipe(map(mapComment));
  }

  deleteBandComment(commentId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_BAND_COMMENT(commentId));
  }
}
