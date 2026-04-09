import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { AdminEndpoints, BandEndpoints } from "../../shared/constants/endpoints";
import { Band } from "../../shared/models/band";
import { BandSummary } from "../../shared/models/band-summary";
import { PendingApprovalDto } from "./album.servics";

export interface CreateBandDto {
  name: string;
  formedYear: number;
  countryIds: string[];
  genreIds: string[];
  facebook?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

interface BandsResponse {
  bands: {
    pageIndex: number;
    pageSize: number;
    count: number;
    data: Band[];
  };
}

@Injectable({ providedIn: 'root' })
export class BandService {

  private http = inject(BaseHttpService);

  getAll(params?: Record<string, unknown>) {
    return this.http.get<BandsResponse>(BandEndpoints.GET_ALL, params).pipe(
      map(response => response.bands.data)
    );
  }

  getNames() {
    return this.http.get<{ bands: { id: string; name: string }[] }>(BandEndpoints.GET_NAMES).pipe(
      map(response => response.bands)
    );
  }

  getSummaries() {
    return this.http.get<{ bands: BandSummary[] }>(BandEndpoints.GET_SUMMARIES).pipe(
      map(response => response.bands)
    );
  }

  getAllPaginated(params: { pageIndex: number; pageSize: number; sortBy?: string; genreId?: string; countryId?: string; status?: string; formedYear?: string }) {
    return this.http.get<BandsResponse>(BandEndpoints.GET_ALL, params).pipe(
      map(response => response.bands)
    );
  }

  getById(id: string) {
    return this.http.get<{ band: Band }>(BandEndpoints.GET_BY_ID(id)).pipe(
      map(response => response.band)
    );
  }

  create(dto: CreateBandDto, logo?: File | null) {
    const form = new FormData();
    form.append('band', JSON.stringify(dto));
    if (logo) form.append('logoUrl', logo, logo.name);
    return this.http.post<Band>(BandEndpoints.CREATE, form);
  }

  update(id: string, dto: CreateBandDto, logo?: File | null) {
    const form = new FormData();
    form.append('band', JSON.stringify(dto));
    if (logo) form.append('logoUrl', logo, logo.name);
    return this.http.put<Band>(BandEndpoints.UPDATE(id), form);
  }

  delete(id: string) {
    return this.http.delete<void>(BandEndpoints.DELETE(id));
  }

  adminGetById(id: string) {
    return this.http.get<{ band: Band }>(AdminEndpoints.GET_BAND_BY_ID(id)).pipe(
      map(response => response.band)
    );
  }

  getPendingApproval() {
    return this.http.get<{ bands: PendingApprovalDto[] }>(BandEndpoints.PENDING_APPROVAL).pipe(
      map(response => response.bands)
    );
  }
}
