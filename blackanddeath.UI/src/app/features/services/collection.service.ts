import { inject, Injectable, signal, computed } from '@angular/core';
import { Observable, tap, map } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { CollectionEndpoints } from '../../shared/constants/endpoints';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';

export interface CollectionSummary {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  createdAt: string;
  albumCount: number;
  bandCount: number;
  collectionType: 'album' | 'band';
  albums: { id: string }[];
  bands: { id: string }[];
}

export interface CollectionDetail extends CollectionSummary {
  albums: Album[];
  bands: Band[];
}

export interface CollectionItem {
  id: string;
  type: 'album' | 'band';
}

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private http = inject(BaseHttpService);

  private readonly _collections = signal<CollectionSummary[]>([]);
  readonly all = this._collections.asReadonly();
  readonly count = computed(() => this._collections().length);

  setCollections(cols: CollectionSummary[]): void {
    this._collections.set(cols);
  }

  loadForUser(userId: string): Observable<CollectionSummary[]> {
    return this.http.get<any[]>(CollectionEndpoints.GET_BY_USER(userId)).pipe(
      map(raws => raws.map(r => ({
        ...r,
        albumCount: r.albumsCount ?? r.albumCount ?? 0,
        bandCount: r.bandsCount ?? r.bandCount ?? 0,
        albums: r.albums ?? [],
        bands: r.bands ?? [],
        collectionType: (r.type === 0 || r.type === 'Albums') ? 'album' : 'band',
      } as CollectionSummary))),
      tap(cols => this._collections.set(cols))
    );
  }

  getDetail(id: string): Observable<CollectionDetail> {
    return this.http.get<CollectionDetail>(CollectionEndpoints.GET_BY_ID(id));
  }

  createCollection(userId: string, name: string, collectionType: 'album' | 'band', description?: string, cover?: File | null): Observable<CollectionSummary> {
    const dto = { userId, name, type: collectionType === 'album' ? 0 : 1, description: description ?? null };
    const body = this.toFormData(dto, cover);
    return this.http.post<any>(CollectionEndpoints.CREATE, body).pipe(
      map((raw: any) => ({ ...raw, collectionType: (raw.type === 0 || raw.type === 'Albums') ? 'album' : 'band' } as CollectionSummary)),
      tap(col => this._collections.update(cols => [...cols, col]))
    );
  }

  updateCollection(id: string, userId: string, name: string, description?: string, cover?: File | null): Observable<CollectionSummary> {
    const dto = { userId, name, description: description ?? null };
    const body = this.toFormData(dto, cover);
    return this.http.put<any>(CollectionEndpoints.UPDATE(id), body).pipe(
      map((raw: any) => ({ ...raw, collectionType: (raw.type === 0 || raw.type === 'Albums') ? 'album' : 'band' } as CollectionSummary)),
      tap(updated => this._collections.update(cols => cols.map(c => c.id === id ? updated : c)))
    );
  }

  private toFormData(dto: object, cover?: File | null): FormData {
    const form = new FormData();
    form.append('collection', JSON.stringify(dto));
    if (cover) form.append('coverImage', cover, cover.name);
    return form;
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(CollectionEndpoints.DELETE(id))
      .pipe(tap(() => this._collections.update(cols => cols.filter(c => c.id !== id))));
  }

  addAlbum(collectionId: string, albumId: string): Observable<void> {
    return this.http.post<void>(CollectionEndpoints.ADD_ALBUM(collectionId), { albumId })
      .pipe(tap(() => this._collections.update(cols =>
        cols.map(c => c.id === collectionId ? { ...c, albumCount: c.albumCount + 1 } : c)
      )));
  }

  removeAlbum(collectionId: string, albumId: string): Observable<void> {
    return this.http.delete<void>(CollectionEndpoints.REMOVE_ALBUM(collectionId, albumId))
      .pipe(tap(() => this._collections.update(cols =>
        cols.map(c => c.id === collectionId ? { ...c, albumCount: Math.max(0, c.albumCount - 1) } : c)
      )));
  }

  addBand(collectionId: string, bandId: string): Observable<void> {
    return this.http.post<void>(CollectionEndpoints.ADD_BAND(collectionId), { bandId })
      .pipe(tap(() => this._collections.update(cols =>
        cols.map(c => c.id === collectionId ? { ...c, bandCount: c.bandCount + 1 } : c)
      )));
  }

  removeBand(collectionId: string, bandId: string): Observable<void> {
    return this.http.delete<void>(CollectionEndpoints.REMOVE_BAND(collectionId, bandId))
      .pipe(tap(() => this._collections.update(cols =>
        cols.map(c => c.id === collectionId ? { ...c, bandCount: Math.max(0, c.bandCount - 1) } : c)
      )));
  }

  reorderAlbums(collectionId: string, orderedIds: string[]): Observable<void> {
    return this.http.put<void>(CollectionEndpoints.REORDER_ALBUMS(collectionId), { orderedIds });
  }

  reorderBands(collectionId: string, orderedIds: string[]): Observable<void> {
    return this.http.put<void>(CollectionEndpoints.REORDER_BANDS(collectionId), { orderedIds });
  }

  // Local signal helpers used by picker to track checked state
  collectionsContainingAlbum(albumId: string, checked: Set<string>): string[] {
    return this._collections().filter(c => checked.has(c.id)).map(c => c.id);
  }
}
