import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.servics';
import { Album } from '../../../shared/models/album';
import { AlbumCard } from '../card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';

const SORT_OPTIONS = [
  { value: 'Newest', label: 'Newest' },
  { value: 'Oldest', label: 'Oldest' },
  { value: 'ReleaseDate', label: 'Release Date' },
  { value: 'Title', label: 'Title' },
] as const;
type SortOption = typeof SORT_OPTIONS[number]['value'];
const PAGE_SIZE = 20;


@Component({
  selector: 'app-all-albums',
  templateUrl: './all-albums.html',
  styleUrl: './all-albums.scss',
  imports: [AlbumCard, Pagination],
})
export class AllAlbums implements OnInit {
  private albumService = inject(AlbumService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly sortOptions = SORT_OPTIONS;
  readonly pageSize = PAGE_SIZE;

  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly currentPage = signal(1);
  readonly activeSort = signal<SortOption>('Newest');
  readonly activeName = signal<string | null>(null);
  readonly activeGenreId = signal<string | null>(null);
  readonly activeCountryId = signal<string | null>(null);
  readonly activeType = signal<string | null>(null);
  readonly activeYearFrom = signal<string | null>(null);
  readonly activeYearTo = signal<string | null>(null);
  readonly activeLabelId = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sort = params['sort'] as SortOption;
      const validSort = SORT_OPTIONS.find(o => o.value === sort);
      this.activeSort.set(validSort ? sort : 'Newest');
      this.currentPage.set(Number(params['page']) || 1);
      this.activeName.set(params['name'] ?? null);
      this.activeGenreId.set(params['genreId'] ?? null);
      this.activeCountryId.set(params['countryId'] ?? null);
      this.activeType.set(params['type'] ?? null);
      this.activeYearFrom.set(params['yearFrom'] ?? null);
      this.activeYearTo.set(params['yearTo'] ?? null);
      this.activeLabelId.set(params['labelId'] ?? null);
      this.load();
    });
  }

  onSortChange(sort: string): void {
    this.activeSort.set(sort as SortOption);
    this.currentPage.set(1);
    this.updateUrl();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: this.activeSort(),
        page: this.currentPage(),
        name: this.activeName() ?? undefined,
        genreId: this.activeGenreId() ?? undefined,
        countryId: this.activeCountryId() ?? undefined,
        type: this.activeType() ?? undefined,
        yearFrom: this.activeYearFrom() ?? undefined,
        yearTo: this.activeYearTo() ?? undefined,
        labelId: this.activeLabelId() ?? undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    this.albumService.getAllPaginated({
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort(),
      genreId: this.activeGenreId() ?? undefined,
      countryId: this.activeCountryId() ?? undefined,
      type: this.activeType() ?? undefined,
      yearFrom: this.activeYearFrom() ?? undefined,
      yearTo: this.activeYearTo() ?? undefined,
      labelId: this.activeLabelId() ?? undefined,
    }).subscribe({
      next: (result) => {
        this.albums.set(result.data);
        this.total.set(result.count);
        this.loaded.set(true);
      },
    });
  }
}
