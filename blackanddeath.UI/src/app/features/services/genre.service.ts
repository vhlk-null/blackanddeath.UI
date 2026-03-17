import { inject, Injectable } from "@angular/core";
import { BaseHttpService } from "./intrefaces/http";
import { GenreEndpoints } from "../../shared/constants/endpoints";
import { Genre } from "../../shared/models/genre";
import { PaginatedResult } from "../../shared/models/paginated-result";

@Injectable({ providedIn: 'root' })
export class GenreService {

  private http = inject(BaseHttpService);

  getAll(params?: Record<string, unknown>) {
    return this.http.get<PaginatedResult<Genre[]>>(GenreEndpoints.GET_ALL, params);
  }

  getById(id: string) {
    return this.http.get<Genre>(GenreEndpoints.GET_BY_ID(id));
  }

  create(payload: Omit<Genre, 'id'>) {
    return this.http.post<Genre>(GenreEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Genre, 'id'>>) {
    return this.http.put<Genre>(GenreEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(GenreEndpoints.DELETE(id));
  }
}
