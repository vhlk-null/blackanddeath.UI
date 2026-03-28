import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
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
}

interface AlbumsResponse {
  albums: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Album[];
  };
}

@Injectable({ providedIn: 'root' })
export class AlbumService {

  private http = inject(BaseHttpService);

  getAll(params?: Record<string, unknown>) {
    return this.http.get<AlbumsResponse>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums.data)
    );
  }

  getAllPaginated(params: { pageIndex: number; pageSize: number; sortBy?: string }) {
    return this.http.get<AlbumsResponse>(AlbumEndpoints.GET_ALL, params).pipe(
      map(response => response.albums)
    );
  }

  getById(id: string) {
    return this.http.get<{ album: Album }>(AlbumEndpoints.GET_BY_ID(id)).pipe(
      map(response => response.album)
    );
  }

  getByBand(bandId: string, params?: Record<string, unknown>) {
    return this.http.get<PaginatedResult<Album>>(AlbumEndpoints.GET_BY_BAND(bandId), params).pipe(
      map(response => response.data)
    );
  }

  create(dto: CreateAlbumDto, cover?: File | null) {
    const form = new FormData();
    form.append('Album', JSON.stringify(dto));
    if (cover) {
      form.append('CoverImage', cover, cover.name);
    }
    return this.http.post<Album>(AlbumEndpoints.CREATE, form);
  }

  update(id: string, dto: CreateAlbumDto) {
    return this.http.put<Album>(AlbumEndpoints.UPDATE, { id, ...dto });
  }

  delete(id: string) {
    return this.http.delete<void>(AlbumEndpoints.DELETE(id));
  }
}
