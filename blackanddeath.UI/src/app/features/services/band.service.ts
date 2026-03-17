import { inject, Injectable } from "@angular/core";
import { BaseHttpService } from "./intrefaces/http";
import { BandEndpoints } from "../../shared/constants/endpoints";
import { Band } from "../../shared/models/band";
import { PaginatedResult } from "../../shared/models/paginated-result";

@Injectable({ providedIn: 'root' })
export class BandService {

  private http = inject(BaseHttpService);

  getAll(params?: Record<string, unknown>) {
    return this.http.get<PaginatedResult<Band[]>>(BandEndpoints.GET_ALL, params);
  }

  getById(id: string) {
    return this.http.get<Band>(BandEndpoints.GET_BY_ID(id));
  }

  create(payload: Omit<Band, 'id'>) {
    return this.http.post<Band>(BandEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Band, 'id'>>) {
    return this.http.put<Band>(BandEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(BandEndpoints.DELETE(id));
  }
}
