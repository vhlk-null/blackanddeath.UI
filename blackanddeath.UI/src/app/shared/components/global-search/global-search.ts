import { Component, inject, signal, output, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { SearchService } from '../../../features/services/search.service';
import { AlbumSearchDocument } from '../../models/album-search-document';
import { BandSearchDocument } from '../../models/band-search-document';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.html',
  styleUrl: './global-search.scss',
})
export class GlobalSearch implements AfterViewInit {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);

  readonly closed = output<void>();

  readonly query = signal('');
  readonly includeTracksEnabled = signal(false);
  readonly albumResults = signal<AlbumSearchDocument[]>([]);
  readonly trackResults = signal<AlbumSearchDocument[]>([]);
  readonly bandResults = signal<BandSearchDocument[]>([]);
  readonly searching = signal(false);
  readonly hasSearched = signal(false);

  private readonly query$ = new Subject<{ q: string; includeTracks: boolean }>();

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  constructor() {
    this.query$.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a.q === b.q && a.includeTracks === b.includeTracks),
      switchMap(({ q, includeTracks }) => {
        if (!q.trim()) {
          this.albumResults.set([]);
          this.trackResults.set([]);
          this.bandResults.set([]);
          this.hasSearched.set(false);
          this.searching.set(false);
          return of(null);
        }
        this.searching.set(true);
        const requests: [any, any, any?] = [
          this.searchService.searchAlbums({ q, pageSize: 5 }),
          this.searchService.searchBands({ q, pageSize: 5 }),
          includeTracks ? this.searchService.searchAlbums({ q, pageSize: 5, includeTracks: true }) : of(null),
        ];
        return forkJoin(requests);
      }),
      filter(results => results !== null),
    ).subscribe((results: any) => {
      const albums = results[0];
      const bands = results[1];
      const albumsWithTracks = results[2];
      const albumIds = new Set(albums.data.map((a: any) => a.id));
      this.albumResults.set(albums.data);
      this.bandResults.set(bands.data);
      this.trackResults.set(albumsWithTracks?.data ? albumsWithTracks.data.filter((a: any) => !albumIds.has(a.id)) : []);
      this.searching.set(false);
      this.hasSearched.set(true);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef?.nativeElement.focus(), 50);
  }

  onInput(value: string): void {
    this.query.set(value);
    this.query$.next({ q: value, includeTracks: this.includeTracksEnabled() });
  }

  toggleIncludeTracks(): void {
    this.includeTracksEnabled.update(v => !v);
    this.query$.next({ q: this.query(), includeTracks: this.includeTracksEnabled() });
  }

  goToAlbum(slug: string): void {
    this.router.navigate(['/albums', slug]);
    this.closed.emit();
  }

  goToBand(slug: string): void {
    this.router.navigate(['/bands', slug]);
    this.closed.emit();
  }

  close(): void {
    this.closed.emit();
  }
}
