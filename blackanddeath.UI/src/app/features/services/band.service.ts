import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { BandEndpoints } from "../../shared/constants/endpoints";
import { Band } from "../../shared/models/band";
import { BandSummary } from "../../shared/models/band-summary";

export interface CreateBandDto {
  name: string;
  formedYear: number;
  country: string;
  genre: string;
  subgenres: string;
  label: string;
  bio: string;
  facebook: string;
  youtube: string;
  instagram: string;
  twitter: string;
  website: string;
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

  getSummaries() {
    return this.http.get<{ bands: BandSummary[] }>(BandEndpoints.GET_SUMMARIES).pipe(
      map(response => response.bands)
    );
  }

  getAllPaginated(params?: Record<string, unknown>) {
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
    form.append('Band', JSON.stringify(dto));
    if (logo) {
      form.append('LogoImage', logo, logo.name);
    }
    return this.http.post<Band>(BandEndpoints.CREATE, form);
  }

  update(id: string, payload: Partial<Omit<Band, 'id'>>) {
    return this.http.put<Band>(BandEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(BandEndpoints.DELETE(id));
  }
}
