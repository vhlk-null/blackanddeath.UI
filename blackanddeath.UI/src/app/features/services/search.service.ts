import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { BaseHttpService } from "./intrefaces/http";
import { AlbumSearchDocument } from "../../shared/models/album-search-document";
import { BandSearchDocument } from "../../shared/models/band-search-document";
import { AlbumEndpoints, BandEndpoints } from "../../shared/constants/endpoints";
import { PaginatedResult } from "../../shared/models/paginated-result";

export interface AlbumSearchParams {
  q: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'title' | 'releaseYear' | 'averageRating';
  sortDir?: 'Asc' | 'Desc';
  type?: string;
  releaseYearFrom?: number;
  releaseYearTo?: number;
  genre?: string[];
  country?: string[];
  label?: string[];
  includeTracks?: boolean;
}

export interface BandSearchParams {
  q: string;
  pageIndex?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'name' | 'formedYear' | 'averageRating';
  sortDir?: 'Asc' | 'Desc';
  status?: string;
  formedYearFrom?: number;
  formedYearTo?: number;
  genre?: string[];
  country?: string[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(BaseHttpService);

  searchAlbums(params: AlbumSearchParams): Observable<PaginatedResult<AlbumSearchDocument>> {
    const p: Record<string, unknown> = { q: params.q };
    if (params.pageIndex !== undefined) p['pageIndex'] = params.pageIndex;
    if (params.pageSize !== undefined) p['pageSize'] = params.pageSize;
    if (params.sortBy) p['sortBy'] = params.sortBy;
    if (params.sortDir) p['sortDir'] = params.sortDir;
    if (params.type) p['type'] = params.type;
    if (params.releaseYearFrom !== undefined) p['releaseYearFrom'] = params.releaseYearFrom;
    if (params.releaseYearTo !== undefined) p['releaseYearTo'] = params.releaseYearTo;
    if (params.genre?.length) p['genre'] = params.genre;
    if (params.country?.length) p['country'] = params.country;
    if (params.label?.length) p['label'] = params.label;
    if (params.includeTracks) p['includeTracks'] = true;

    console.log('[SearchService] searchAlbums params:', p);
    return this.http.get<{ albums: PaginatedResult<AlbumSearchDocument> }>(AlbumEndpoints.SEARCH, p, true)
      .pipe(map(res => { console.log('[SearchService] searchAlbums response:', res.albums); return res.albums; }));
  }

  searchBands(params: BandSearchParams): Observable<PaginatedResult<BandSearchDocument>> {
    const p: Record<string, unknown> = { q: params.q };
    if (params.pageIndex !== undefined) p['pageIndex'] = params.pageIndex;
    if (params.pageSize !== undefined) p['pageSize'] = params.pageSize;
    if (params.sortBy) p['sortBy'] = params.sortBy;
    if (params.sortDir) p['sortDir'] = params.sortDir;
    if (params.status) p['status'] = params.status;
    if (params.formedYearFrom !== undefined) p['formedYearFrom'] = params.formedYearFrom;
    if (params.formedYearTo !== undefined) p['formedYearTo'] = params.formedYearTo;
    if (params.genre?.length) p['genre'] = params.genre;
    if (params.country?.length) p['country'] = params.country;

    console.log('[SearchService] searchBands params:', p);
    return this.http.get<{ bands: PaginatedResult<BandSearchDocument> }>(BandEndpoints.SEARCH, p, true)
      .pipe(map(res => { console.log('[SearchService] searchBands response:', res.bands); return res.bands; }));
  }
}
