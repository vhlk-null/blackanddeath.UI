import { inject, Injectable } from "@angular/core";
import { map, switchMap } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { AlbumEndpoints } from "../../shared/constants/endpoints";
import { Album } from "../../shared/models/album";
import { AlbumType } from "../../shared/models/enums/album-type.enum";
import { AlbumFormat } from "../../shared/models/enums/album-format.enum";
import { StreamingLink } from "../../shared/models/streaming-link";
import { PaginatedResult } from "../../shared/models/paginated-result";

export interface CreateAlbumDto {
  title: string;
  releaseDate: number;
  type: AlbumType;
  format: AlbumFormat;
  bandIds?: string[];
  countryIds?: string[];
  genreIds?: string[];
  labelIds?: string[];
  tagIds?: string[];
  streamingLinks?: StreamingLink[];
  tracks?: { trackNumber: number; title: string; duration: string }[];
}


@Injectable({ providedIn: 'root' })
export class AlbumService {

  private http = inject(BaseHttpService);

  getAll(params?: Record<string, unknown>) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums.data)
    );
  }

  getAllPaginated(params: { pageIndex: number; pageSize: number; sortBy?: string; genreId?: string; countryId?: string; type?: string; year?: string; labelId?: string }) {
    return this.http.get<{ albums: PaginatedResult<Album> }>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums)
    );
  }

  getById(id: string) {
    return this.http.get<{ album: Album }>(AlbumEndpoints.GET_BY_ID(id)).pipe(
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
    if (cover) {
      form.append('coverImage', cover, cover.name);
    }
    return this.http.post<Album>(AlbumEndpoints.CREATE, form);
  }

  update(id: string, dto: CreateAlbumDto, cover?: File | null) {
    const form = new FormData();
    form.append('album', JSON.stringify(dto));
    const update$ = this.http.put<Album>(AlbumEndpoints.UPDATE(id), form);
    if (cover) {
      const form = new FormData();
      form.append('coverImage', cover, cover.name);
      return update$.pipe(
        switchMap(album =>
          this.http.put<void>(AlbumEndpoints.UPDATE_COVER(id), form).pipe(map(() => album))
        )
      );
    }
    return update$;
  }

  delete(id: string) {
    return this.http.delete<void>(AlbumEndpoints.DELETE(id));
  }
}
