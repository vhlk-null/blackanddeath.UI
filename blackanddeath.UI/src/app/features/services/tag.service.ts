import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { TagEndpoints } from "../../shared/constants/endpoints";
import { Tag } from "../../shared/models/tag";

@Injectable({ providedIn: 'root' })
export class TagService {

  private http = inject(BaseHttpService);

  getAll() {
    return this.http.get<{ tags: Tag[] }>(TagEndpoints.GET_ALL).pipe(
      map(response => response.tags)
    );
  }

  create(payload: Omit<Tag, 'id'>) {
    return this.http.post<Tag>(TagEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Tag, 'id'>>) {
    return this.http.put<Tag>(TagEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(TagEndpoints.DELETE(id));
  }
}
