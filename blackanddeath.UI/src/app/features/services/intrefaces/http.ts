import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SKIP_LOADER } from '../../../core/interceptors/loader.interceptor';

@Injectable({ providedIn: 'root' })
export class BaseHttpService {
  private http = inject(HttpClient);

  get<T = any>(url: string, params?: Record<string, unknown>, skipLoader = false): Observable<T> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach(v => { httpParams = httpParams.append(key, String(v)); });
        } else {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }
    const context = skipLoader ? new HttpContext().set(SKIP_LOADER, true) : undefined;
    return this.http.get<T>(url, { params: httpParams, context });
  }

  post<T>(url: string, payload: unknown): Observable<T> {
    return this.http.post<T>(url, payload);
  }

  put<T>(url: string, payload: unknown): Observable<T> {
    return this.http.put<T>(url, payload);
  }

  patch<T>(url: string, payload: unknown): Observable<T> {
    return this.http.patch<T>(url, payload);
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url);
  }

  externalGet<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }
}
