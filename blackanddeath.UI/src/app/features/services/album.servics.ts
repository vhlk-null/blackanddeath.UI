import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { AlbumEndpoints } from "../../shared/constants/endpoints";
import { Album } from "../../shared/models/album";
import { PaginatedResult } from "../../shared/models/paginated-result";

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

  getById(id: string) {
    return this.http.get<Album>(AlbumEndpoints.GET_BY_ID(id));
  }

  getByBand(bandId: string, params?: Record<string, unknown>) {
    return this.http.get<PaginatedResult<Album>>(AlbumEndpoints.GET_BY_BAND(bandId), params);
  }

  create(payload: Omit<Album, 'id'>) {
    return this.http.post<Album>(AlbumEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Album, 'id'>>) {
    return this.http.put<Album>(AlbumEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(AlbumEndpoints.DELETE(id));
  }
}
