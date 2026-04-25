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
  isEdited: boolean;
  parentCommentId: string | null;
  replyToCommentId: string | null;
  replyToUsername: string | null;
  likes: number;
  dislikes: number;
  userReaction: boolean | null;
  replies: Comment[];
}

interface CommentDto {
  id: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
  parentCommentId: string | null;
  replyToCommentId: string | null;
  replyToUsername: string | null;
  likes: number;
  dislikes: number;
  userReaction: boolean | null;
  replies: CommentDto[];
}

function dtoToComment(dto: CommentDto, replies: Comment[]): Comment {
  return {
    id: dto.id,
    userId: dto.userId,
    username: dto.username,
    body: dto.body,
    createdAt: dto.createdAt,
    isEdited: dto.updatedAt != null || dto.isEdited === true,
    parentCommentId: dto.parentCommentId,
    replyToCommentId: dto.replyToCommentId ?? null,
    replyToUsername: dto.replyToUsername ?? null,
    likes: dto.likes ?? 0,
    dislikes: dto.dislikes ?? 0,
    userReaction: dto.userReaction ?? null,
    replies,
  };
}

function buildReplyTree(flat: CommentDto[], parentId: string): Comment[] {
  return flat
    .filter(d => d.parentCommentId === parentId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(d => dtoToComment(d, buildReplyTree(flat, d.id)));
}

function mapComment(dto: CommentDto): Comment {
  const allReplies: CommentDto[] = [];
  function collect(items: CommentDto[]) {
    for (const item of items) {
      allReplies.push(item);
      if (item.replies?.length) collect(item.replies);
    }
  }
  collect(dto.replies ?? []);
  return dtoToComment(dto, buildReplyTree(allReplies, dto.id));
}

function mapCommentPage(items: CommentDto[]): Comment[] {
  // Flatten everything, then rebuild the tree. Handles both pre-nested
  // and fully-flat API responses.
  const all: CommentDto[] = [];
  function collect(list: CommentDto[]) {
    for (const item of list) {
      all.push(item);
      if (item.replies?.length) collect(item.replies);
    }
  }
  collect(items);
  const roots = all.filter(d => !d.parentCommentId);
  return roots.map(d => dtoToComment(d, buildReplyTree(all, d.id)));
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(BaseHttpService);

  getAlbumComments(albumId: string, params: { pageIndex: number; pageSize: number; userId?: string }) {
    return this.http.get<PaginatedResult<CommentDto>>(
      CommentEndpoints.GET_ALBUM_COMMENTS(albumId), params
    ).pipe(
      map(r => ({ ...r, data: mapCommentPage(r.data ?? []) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 20 })),
    );
  }

  createAlbumComment(payload: { albumId: string; userId: string; username: string; body: string; parentCommentId?: string | null; replyToCommentId?: string | null; replyToUsername?: string | null }) {
    return this.http.post<CommentDto>(CommentEndpoints.CREATE_ALBUM_COMMENT, payload).pipe(map(mapComment));
  }

  updateAlbumComment(commentId: string, payload: { body: string }) {
    return this.http.put<CommentDto>(CommentEndpoints.UPDATE_ALBUM_COMMENT(commentId), payload).pipe(map(mapComment));
  }

  deleteAlbumComment(commentId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_ALBUM_COMMENT(commentId));
  }

  reactAlbumComment(commentId: string, payload: { userId: string; isLike: boolean }) {
    return this.http.post<void>(CommentEndpoints.REACT_ALBUM_COMMENT(commentId), payload);
  }

  removeAlbumCommentReaction(commentId: string, userId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_ALBUM_COMMENT_REACTION(commentId, userId));
  }

  getBandComments(bandId: string, params: { pageIndex: number; pageSize: number; userId?: string }) {
    return this.http.get<PaginatedResult<CommentDto>>(
      CommentEndpoints.GET_BAND_COMMENTS(bandId), params
    ).pipe(
      map(r => ({ ...r, data: mapCommentPage(r.data ?? []) })),
      catchError(() => of({ data: [], count: 0, pageIndex: 1, pageSize: 20 })),
    );
  }

  createBandComment(payload: { bandId: string; userId: string; username: string; body: string; parentCommentId?: string | null; replyToCommentId?: string | null; replyToUsername?: string | null }) {
    return this.http.post<CommentDto>(CommentEndpoints.CREATE_BAND_COMMENT, payload).pipe(map(mapComment));
  }

  updateBandComment(commentId: string, payload: { body: string }) {
    return this.http.put<CommentDto>(CommentEndpoints.UPDATE_BAND_COMMENT(commentId), payload).pipe(map(mapComment));
  }

  deleteBandComment(commentId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_BAND_COMMENT(commentId));
  }

  reactBandComment(commentId: string, payload: { userId: string; isLike: boolean }) {
    return this.http.post<void>(CommentEndpoints.REACT_BAND_COMMENT(commentId), payload);
  }

  removeBandCommentReaction(commentId: string, userId: string) {
    return this.http.delete<void>(CommentEndpoints.DELETE_BAND_COMMENT_REACTION(commentId, userId));
  }
}
