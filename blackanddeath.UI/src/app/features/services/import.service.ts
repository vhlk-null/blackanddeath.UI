import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { BaseHttpService } from './intrefaces/http';
import { AdminEndpoints } from '../../shared/constants/endpoints';

export interface BandCandidate {
  mbId: string;
  name: string;
  disambiguation: string | null;
  country: string | null;
  formedYear: number | null;
  profileUrl: string | null;
}

export interface BandPreviewAlbum {
  title: string;
  year: number | null;
  type: string;
  existsInDb: boolean;
  slug: string | null;
  mbUrl: string | null;
}

export interface BandPreview {
  mbId: string;
  name: string;
  country: string | null;
  formedYear: number | null;
  disbandedYear: number | null;
  isActive: boolean;
  tags: string[];
  albumCount: number;
  albums: BandPreviewAlbum[];
}

export interface ImportStatus {
  isRunning: boolean;
  bandName: string | null;
  current: number;
  total: number;
}

export interface ImportProgressEvent {
  stage: 'BandFound' | 'FetchingAlbum' | 'AlbumFetched' | 'Done' | 'Error' | 'Saving' | 'GenresMissing';
  message: string;
  current: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class ImportService {
  private auth = inject(AuthService);
  private http = inject(BaseHttpService);

  getStatus() {
    return this.http.get<ImportStatus>(AdminEndpoints.IMPORT_BAND_STATUS);
  }

  searchBands(bandName: string) {
    return this.http.get<BandCandidate[]>(`${AdminEndpoints.IMPORT_BAND_SEARCH}?bandName=${encodeURIComponent(bandName)}`);
  }

  previewBand(mbid: string) {
    return this.http.get<BandPreview>(`${AdminEndpoints.IMPORT_BAND_PREVIEW}?mbId=${encodeURIComponent(mbid)}`);
  }

  private abortController: AbortController | null = null;

  cancelImport(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  async *streamImport(mbid: string, bandName: string, selectedAlbumMbIds: string[]): AsyncGenerator<ImportProgressEvent> {
    const params = new URLSearchParams({ mbId: mbid, bandName });
    selectedAlbumMbIds.forEach(id => params.append('albumMbIds', id));
    const url = `${AdminEndpoints.IMPORT_BAND_STREAM}?${params}`;
    const token = this.auth.getAccessToken();

    this.abortController = new AbortController();

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      signal: this.abortController.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              yield JSON.parse(line.slice(6)) as ImportProgressEvent;
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
