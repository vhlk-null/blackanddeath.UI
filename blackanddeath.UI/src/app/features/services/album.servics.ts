import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { AdminEndpoints, AlbumEndpoints } from "../../shared/constants/endpoints";
import { Album } from "../../shared/models/album";
import { AlbumType } from "../../shared/models/enums/album-type.enum";
import { AlbumFormat } from "../../shared/models/enums/album-format.enum";
import { StreamingLink } from "../../shared/models/streaming-link";
import { PaginatedResult } from "../../shared/models/paginated-result";

export interface PendingApprovalDto {
  id: string;
  name: string;
  slug: string | null;
  createdBy: string;
}

export interface CreateAlbumDto {
  title: string;
  releaseDate: number;
  releaseMonth?: number | null;
  releaseDay?: number | null;
  type: AlbumType;
  format: AlbumFormat;
  bandIds?: string[];
  bandNames?: string[];
  countryIds?: string[];
  genreIds?: string[];
  labelIds?: string[];
  labelNames?: string[];
  tagIds?: string[];
  streamingLinks?: StreamingLink[];
  tracks?: { trackNumber: number; title: string; duration: string }[];
}


@Injectable({ providedIn: 'root' })
export class AlbumService {

  private http = inject(BaseHttpService);

  getNames() {
    return this.http.get<{ albums: { id: string; name: string }[] }>(AlbumEndpoints.GET_NAMES).pipe(
      map(response => response.albums)
    );
  }

  getAll(params?: Record<string, unknown>) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums.data)
    );
  }

  getAllPaginated(params: { pageIndex: number; pageSize: number; sortBy?: string; sortDir?: string; name?: string; genreId?: string; genreName?: string[]; countryId?: string; countryName?: string[]; type?: string[]; yearFrom?: string; yearTo?: string; labelId?: string; labelName?: string[]; ratingFrom?: number; ratingTo?: number }) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums)
    );
  }

  getById(id: string) {
    return this.http.get<{ album: Album }>(AlbumEndpoints.GET_BY_ID(id)).pipe(
      map(response => response.album)
    );
  }

  getBySlug(slug: string, params?: { similarPageNumber?: number; similarPageSize?: number }) {
    return this.http.get<{ album: Album }>(AlbumEndpoints.GET_BY_SLUG(slug), params).pipe(
      map(response => response.album)
    );
  }

  getByBand(bandId: string, params?: Record<string, unknown>) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_BY_BAND(bandId), params).pipe(
      map(response => response.albums.data)
    );
  }

  create(dto: CreateAlbumDto, cover?: File | null) {
    const form = new FormData();
    form.append('album', JSON.stringify(dto));
    if (cover) form.append('coverImage', cover, cover.name);
    return this.http.post<Album>(AlbumEndpoints.CREATE, form);
  }

  update(id: string, dto: CreateAlbumDto, cover?: File | null) {
    const form = new FormData();
    form.append('album', JSON.stringify(dto));
    if (cover) form.append('coverImage', cover, cover.name);
    return this.http.put<Album>(AlbumEndpoints.UPDATE(id), form);
  }

  delete(id: string) {
    return this.http.delete<void>(AlbumEndpoints.DELETE(id));
  }

  adminGetById(id: string) {
    return this.http.get<{ album: Album }>(AdminEndpoints.GET_ALBUM_BY_ID(id)).pipe(
      map(response => response.album)
    );
  }

  getUpcoming(params?: Record<string, unknown>) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_UPCOMING, params, true).pipe(
      map(response => response.albums.data)
    );
  }

  getPendingApproval() {
    return this.http.get<{ albums: PendingApprovalDto[] }>(AlbumEndpoints.PENDING_APPROVAL).pipe(
      map(response => response.albums)
    );
  }
}
