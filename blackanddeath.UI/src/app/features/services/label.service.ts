import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { LabelEndpoints } from "../../shared/constants/endpoints";
import { Label } from "../../shared/models/label";

@Injectable({ providedIn: 'root' })
export class LabelService {

  private http = inject(BaseHttpService);

  getAll() {
    return this.http.get<{ labels: Label[] }>(LabelEndpoints.GET_ALL).pipe(
      map(response => response.labels)
    );
  }

  getById(id: string) {
    return this.http.get<Label>(LabelEndpoints.GET_BY_ID(id));
  }

  create(payload: Omit<Label, 'id'>) {
    return this.http.post<Label>(LabelEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Label, 'id'>>) {
    return this.http.put<Label>(LabelEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(LabelEndpoints.DELETE(id));
  }
}
