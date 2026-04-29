import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { BaseHttpService } from './intrefaces/http';
import { AdminEndpoints } from '../../shared/constants/endpoints';

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

  async *streamImport(bandName: string): AsyncGenerator<ImportProgressEvent> {
    const url = `${AdminEndpoints.IMPORT_BAND_STREAM}?bandName=${encodeURIComponent(bandName)}`;
    const token = this.auth.getAccessToken();

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok || !response.body) {
      throw new Error(`Request failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

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
  }
}
