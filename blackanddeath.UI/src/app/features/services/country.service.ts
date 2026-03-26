import { inject, Injectable } from "@angular/core";
import { map } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { CountryEndpoints } from "../../shared/constants/endpoints";
import { Country } from "../../shared/models/country";

@Injectable({ providedIn: 'root' })
export class CountryService {

  private http = inject(BaseHttpService);

  getAll() {
    return this.http.get<{ countries: Country[] }>(CountryEndpoints.GET_ALL).pipe(
      map(response => response.countries)
    );
  }

  getById(id: string) {
    return this.http.get<Country>(CountryEndpoints.GET_BY_ID(id));
  }

  create(payload: Omit<Country, 'id'>) {
    return this.http.post<Country>(CountryEndpoints.CREATE, payload);
  }

  update(id: string, payload: Partial<Omit<Country, 'id'>>) {
    return this.http.put<Country>(CountryEndpoints.UPDATE(id), payload);
  }

  delete(id: string) {
    return this.http.delete<void>(CountryEndpoints.DELETE(id));
  }
}
