import { Component, inject, signal, output, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
  readonly albumResults = signal<AlbumSearchDocument[]>([]);
  readonly bandResults = signal<BandSearchDocument[]>([]);
  readonly searching = signal(false);
  readonly hasSearched = signal(false);

  private readonly query$ = new Subject<string>();

  @ViewChild('inputRef') inputRef!: ElementRef<HTMLInputElement>;

  constructor() {
    this.query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        if (!q.trim()) {
          this.albumResults.set([]);
          this.bandResults.set([]);
          this.hasSearched.set(false);
          this.searching.set(false);
          return [];
        }
        this.searching.set(true);
        return forkJoin([
          this.searchService.searchAlbums({ q, pageSize: 10 }),
          this.searchService.searchBands({ q, pageSize: 10 }),
        ]);
      }),
    ).subscribe(([albums, bands]) => {
      this.albumResults.set(albums.data);
      this.bandResults.set(bands.data);
      this.searching.set(false);
      this.hasSearched.set(true);
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputRef?.nativeElement.focus(), 50);
  }

  onInput(value: string): void {
    this.query.set(value);
    this.query$.next(value);
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
