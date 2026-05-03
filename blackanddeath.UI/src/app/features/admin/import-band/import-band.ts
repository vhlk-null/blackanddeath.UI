import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImportService, BandCandidate, BandPreview } from '../../services/import.service';

@Component({
  selector: 'app-import-band',
  imports: [FormsModule],
  templateUrl: './import-band.html',
  styleUrl: './import-band.scss',
})
export class ImportBand implements OnInit {
  private importService = inject(ImportService);

  bandName = '';

  readonly searching = signal(false);
  readonly candidates = signal<BandCandidate[] | null>(null);

  readonly previewing = signal(false);
  readonly preview = signal<BandPreview | null>(null);
  readonly selectedMbIds = signal<Set<string>>(new Set());

  readonly loading = signal(false);
  readonly statusMessage = signal('');
  readonly progress = signal(0);
  readonly total = signal(0);
  readonly doneMessage = signal<string | null>(null);
  readonly warnings = signal<string[]>([]);
  readonly infos = signal<string[]>([]);
  readonly error = signal<string | null>(null);

  private mbIdFromUrl(mbUrl: string | null): string | null {
    if (!mbUrl) return null;
    // MusicBrainz: /release-group/<uuid>
    const mbMatch = mbUrl.match(/release-group\/([a-f0-9-]+)/);
    if (mbMatch) return mbMatch[1];
    // Discogs: /master/<id> or /release/<id>
    const discogsMatch = mbUrl.match(/\/(master|release)\/(\d+)/);
    if (discogsMatch) return `${discogsMatch[1]}-${discogsMatch[2]}`;
    return null;
  }

  isSelected(mbUrl: string | null): boolean {
    const id = this.mbIdFromUrl(mbUrl);
    return !!id && this.selectedMbIds().has(id);
  }

  toggleAlbum(mbUrl: string | null): void {
    const id = this.mbIdFromUrl(mbUrl);
    if (!id) return;
    this.selectedMbIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  get selectedCount(): number {
    return this.selectedMbIds().size;
  }

  get selectableCount(): number {
    return this.preview()?.albums.filter(a => !a.existsInDb && a.mbUrl).length ?? 0;
  }

  get allSelected(): boolean {
    return this.selectableCount > 0 && this.selectedCount === this.selectableCount;
  }

  toggleAll(): void {
    const p = this.preview();
    if (!p) return;
    if (this.allSelected) {
      this.selectedMbIds.set(new Set());
    } else {
      const allIds = new Set<string>();
      for (const album of p.albums) {
        if (!album.existsInDb) {
          const id = this.mbIdFromUrl(album.mbUrl);
          if (id) allIds.add(id);
        }
      }
      this.selectedMbIds.set(allIds);
    }
  }

  ngOnInit(): void {
    this.importService.getStatus().subscribe({
      next: (status) => {
        if (status.isRunning) {
          this.bandName = status.bandName ?? '';
          this.progress.set(status.current);
          this.total.set(status.total);
          this.statusMessage.set(`Resuming import: ${status.bandName}`);
          this.loading.set(true);
          this.resumeStream(status.bandName!);
        }
      },
      error: () => {},
    });
  }

  search(): void {
    const name = this.bandName.trim();
    if (!name || this.searching()) return;

    this.candidates.set(null);
    this.preview.set(null);
    this.error.set(null);
    this.doneMessage.set(null);
    this.warnings.set([]);
    this.infos.set([]);
    this.searching.set(true);

    this.importService.searchBands(name).subscribe({
      next: (results) => {
        this.searching.set(false);
        if (results.length === 1) {
          this.fetchPreview(results[0].mbId);
        } else {
          this.candidates.set(results);
        }
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Search failed');
        this.searching.set(false);
      },
    });
  }

  selectCandidate(candidate: BandCandidate): void {
    this.candidates.set(null);
    this.fetchPreview(candidate.mbId);
  }

  private fetchPreview(mbid: string): void {
    this.preview.set(null);
    this.error.set(null);
    this.previewing.set(true);

    this.importService.previewBand(mbid).subscribe({
      next: (data) => {
        this.preview.set(data);
        const preSelected = new Set<string>();
        for (const album of data.albums) {
          if (!album.existsInDb) {
            const id = this.mbIdFromUrl(album.mbUrl);
            if (id) preSelected.add(id);
          }
        }
        this.selectedMbIds.set(preSelected);
        this.previewing.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? err?.message ?? 'Failed to fetch preview');
        this.previewing.set(false);
      },
    });
  }

  backToCandidates(): void {
    this.preview.set(null);
    this.error.set(null);
    this.search();
  }

  resetSearch(): void {
    this.candidates.set(null);
    this.preview.set(null);
    this.error.set(null);
  }

  async confirmImport(): Promise<void> {
    const p = this.preview();
    if (!p || this.loading() || this.selectedCount === 0) return;

    const selectedIds = [...this.selectedMbIds()];

    this.preview.set(null);
    this.selectedMbIds.set(new Set());
    this.loading.set(true);
    this.doneMessage.set(null);
    this.error.set(null);
    this.warnings.set([]);
    this.infos.set([]);
    this.progress.set(0);
    this.total.set(0);
    this.statusMessage.set('');

    await this.runStream(p.mbId, p.name, selectedIds);
  }

  private async resumeStream(bandName: string): Promise<void> {
    this.doneMessage.set(null);
    this.error.set(null);
    await this.runStream('', bandName, []);
  }

  private async runStream(mbid: string, bandName: string, selectedAlbumMbIds: string[]): Promise<void> {
    try {
      for await (const event of this.importService.streamImport(mbid, bandName, selectedAlbumMbIds)) {
        this.statusMessage.set(event.message);
        if (event.total > 0) this.total.set(event.total);
        if (event.current > 0) this.progress.set(event.current);

        if (event.stage === 'Done') {
          this.progress.set(this.total());
          this.bandName = '';
          this.parseDoneMessage(event.message);
        } else if (event.stage === 'Error') {
          this.error.set(event.message);
        }
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        this.error.set(err?.message ?? 'Unexpected error');
      }
    } finally {
      this.loading.set(false);
    }
  }

  private parseDoneMessage(message: string): void {
    const parts = message.split('|').map(p => p.trim());
    this.doneMessage.set(parts[0]);
    const warnings: string[] = [];
    const infos: string[] = [];
    for (const part of parts.slice(1)) {
      if (part.startsWith('⚠')) warnings.push(part.slice(1).trim());
      else if (part.startsWith('✓')) infos.push(part.slice(1).trim());
    }
    this.warnings.update(w => [...w, ...warnings]);
    this.infos.set(infos);
  }

  cancel(): void {
    this.importService.cancelImport();
  }

  get progressPercent(): number {
    const t = this.total();
    return t > 0 ? Math.round((this.progress() / t) * 100) : 0;
  }
}
