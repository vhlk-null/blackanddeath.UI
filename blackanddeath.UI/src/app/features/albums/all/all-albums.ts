import { Component, computed, inject, OnInit, signal, HostListener, ElementRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { take } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { AlbumService } from '../../services/album.servics';
import { SearchService } from '../../services/search.service';
import { AlbumSearchDocument } from '../../../shared/models/album-search-document';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { AlbumFormat } from '../../../shared/models/enums/album-format.enum';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
import { RatingService } from '../../services/rating.service';
import { Album } from '../../../shared/models/album';
import { Genre } from '../../../shared/models/genre';
import { Country } from '../../../shared/models/country';
import { Label } from '../../../shared/models/label';
import { AlbumCard } from '../card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { MultiSelectNames } from '../../../shared/components/multi-select-names/multi-select-names';

const toArray = (v: string | string[] | undefined): string[] =>
  !v ? [] : Array.isArray(v) ? v : [v];

const SORT_OPTIONS = [
  { value: 'CreatedAt', label: 'Recently Added' },
  { value: 'ReleaseDate', label: 'Release Date' },
  { value: 'Title', label: 'Title' },
  { value: 'Rating', label: 'Rating' },
] as const;
type SortOption = typeof SORT_OPTIONS[number]['value'];
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 20;

const ALBUM_TYPE_MAP: Record<string, string> = {
  'Full-length': 'FullLength',
  'EP': 'EP',
  'Single': 'Single',
  'Live': 'LiveAlbum',
  'Compilation': 'Compilation',
  'Demo': 'Demo',
  'Split': 'Split',
};
const ALBUM_TYPE_REVERSE: Record<string, string> = Object.fromEntries(
  Object.entries(ALBUM_TYPE_MAP).map(([k, v]) => [v, k])
);
const ALBUM_TYPES = Object.keys(ALBUM_TYPE_MAP);

@Component({
  selector: 'app-all-albums',
  templateUrl: './all-albums.html',
  styleUrl: './all-albums.scss',
  imports: [AlbumCard, Pagination, MultiSelectNames],
})
export class AllAlbums implements OnInit {
  private el = inject(ElementRef);

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.showSortMenu()) return;
    const wrap = this.el.nativeElement.querySelector('.all-albums__sort-wrap');
    if (wrap && !wrap.contains(e.target as Node)) this.showSortMenu.set(false);
  }

  private albumService = inject(AlbumService);
  private searchService = inject(SearchService);
  private ratingService = inject(RatingService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private titleService = inject(Title);

  readonly albumTypes = ALBUM_TYPES;
  readonly sortOptions = SORT_OPTIONS;
  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly labels = signal<Label[]>([]);
  readonly filtersOpen = signal(false);
  readonly showSortMenu = signal(false);
  readonly searchQuery = signal('');
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private filterTimer: ReturnType<typeof setTimeout> | null = null;

  readonly yearMin = 1950;
  readonly yearMax = new Date().getFullYear();

  readonly activeSort = signal<SortOption>('ReleaseDate');
  readonly activeSortDir = signal<SortDir>('desc');
  readonly activeName = signal<string | null>(null);
  readonly activeGenreNames = signal<string[]>([]);
  readonly activeCountryNames = signal<string[]>([]);
  readonly activeTypes = signal<string[]>([]);
  readonly activeYearFrom = signal<string | null>(null);
  readonly activeYearTo = signal<string | null>(null);
  readonly activeLabelNames = signal<string[]>([]);
  readonly activeUpcoming = signal<boolean>(false);
  readonly activeRatingFrom = signal<number | null>(null);
  readonly activeRatingTo = signal<number | null>(null);

  readonly draftGenres = signal<string[]>([]);
  readonly draftCountries = signal<string[]>([]);
  readonly draftLabels = signal<string[]>([]);
  readonly draftTypes = signal<string[]>([]);
  readonly draftYearFrom = signal<number>(this.yearMin);
  readonly draftYearTo = signal<number>(this.yearMax);
  readonly draftUpcoming = signal<boolean>(false);
  readonly ratingMin = 1;
  readonly ratingMax = 10;
  readonly draftRatingFrom = signal<number>(1);
  readonly draftRatingTo = signal<number>(10);
  readonly draftRatingFromPct = computed(() => ((this.draftRatingFrom() - this.ratingMin) / (this.ratingMax - this.ratingMin)) * 100);
  readonly draftRatingToPct = computed(() => ((this.draftRatingTo() - this.ratingMin) / (this.ratingMax - this.ratingMin)) * 100);

  readonly genreGroups = computed(() => {
    const all = this.genres();
    const parents = all.filter(g => !g.parentGenreId);
    const groups = parents.map(p => ({
      label: p.name,
      items: all.filter(g => g.parentGenreId === p.id).map(g => g.name),
    })).filter(g => g.items.length > 0);
    const ungrouped = all.filter(g => !g.parentGenreId && !all.some(c => c.parentGenreId === g.id)).map(g => g.name);
    if (ungrouped.length) groups.push({ label: 'Other', items: ungrouped });
    return groups;
  });
  readonly countryNames = computed(() => this.countries().map(c => c.name));
  readonly labelNames = computed(() => this.labels().map(l => l.name));

  readonly draftYearFromPct = computed(() => ((this.draftYearFrom() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);
  readonly draftYearToPct = computed(() => ((this.draftYearTo() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);

  readonly pageSize = PAGE_SIZE;
  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly skeletonItems = Array(20).fill(0);
  readonly currentPage = signal(1);
  private appendPage = 1;
  readonly loadedPage = signal(1);

  ngOnInit(): void {
    this.titleService.setTitle('Albums — Black And Death');
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));
    this.labelService.getAll().subscribe(l => this.labels.set(l));

    this.route.queryParams.pipe(take(1)).subscribe((params: Params) => {
      const sort = params['sortBy'] as SortOption;
      this.activeSort.set(SORT_OPTIONS.find(o => o.value === sort) ? sort : 'CreatedAt');
      this.activeSortDir.set(params['sortDir'] === 'asc' ? 'asc' : 'desc');
      this.currentPage.set(Number(params['pageIndex']) || 1);
      this.activeName.set(params['name'] ?? null);
      this.searchQuery.set(params['name'] ?? '');
      this.activeGenreNames.set(toArray(params['genreName']));
      this.activeCountryNames.set(toArray(params['countryName']));
      this.activeTypes.set(toArray(params['type']));
      const exactYear = params['year'] ?? null;
      this.activeYearFrom.set(exactYear ?? params['yearFrom'] ?? null);
      this.activeYearTo.set(exactYear ?? params['yearTo'] ?? null);
      this.activeLabelNames.set(toArray(params['labelName']));
      this.activeUpcoming.set(params['upcoming'] === 'true');
      this.activeRatingFrom.set(params['ratingFrom'] ? +params['ratingFrom'] : null);
      this.activeRatingTo.set(params['ratingTo'] ? +params['ratingTo'] : null);
      this.syncDraftsFromActive();
      this.appendPage = this.currentPage();
      this.loadedPage.set(this.currentPage());
      this.load();
    });
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);

    console.log('Search query changed:', value);
    
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.activeName.set(value.trim() || null);
      this.currentPage.set(1);
      this.updateUrl();
      this.load();
    }, 400);
  }

  toggleFilters(): void {
    if (!this.filtersOpen()) this.syncDraftsFromActive();
    this.filtersOpen.update(v => !v);
  }

  scheduleApply(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.applyFilters(), 400);
  }

  onDraftRatingFrom(value: string): void {
    const v = +value;
    this.draftRatingFrom.set(v >= this.draftRatingTo() ? this.draftRatingTo() - 1 : v);
  }

  onDraftRatingTo(value: string): void {
    const v = +value;
    this.draftRatingTo.set(v <= this.draftRatingFrom() ? this.draftRatingFrom() + 1 : v);
  }

  onDraftYearFrom(value: string): void {
    const v = +value;
    this.draftYearFrom.set(v >= this.draftYearTo() ? this.draftYearTo() - 1 : v);
  }

  onDraftYearTo(value: string): void {
    const v = +value;
    this.draftYearTo.set(v <= this.draftYearFrom() ? this.draftYearFrom() + 1 : v);
  }

  applyFilters(): void {
    this.activeGenreNames.set(this.draftGenres());
    this.activeCountryNames.set(this.draftCountries());
    this.activeLabelNames.set(this.draftLabels());
    this.activeTypes.set(this.draftTypes().map(l => ALBUM_TYPE_MAP[l] ?? l));
    const fromChanged = this.draftYearFrom() !== this.yearMin;
    const toChanged = this.draftYearTo() !== this.yearMax;
    this.activeYearFrom.set(fromChanged || toChanged ? String(this.draftYearFrom()) : null);
    this.activeYearTo.set(fromChanged || toChanged ? String(this.draftYearTo()) : null);
    this.activeUpcoming.set(this.draftUpcoming());
    const ratingFromChanged = this.draftRatingFrom() !== this.ratingMin;
    const ratingToChanged = this.draftRatingTo() !== this.ratingMax;
    this.activeRatingFrom.set(ratingFromChanged || ratingToChanged ? this.draftRatingFrom() : null);
    this.activeRatingTo.set(ratingFromChanged || ratingToChanged ? this.draftRatingTo() : null);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  onSortChange(sort: SortOption): void {
    if (this.activeSort() === sort) {
      this.activeSortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.activeSort.set(sort);
      this.activeSortDir.set('desc');
    }
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrl();
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLoadMore(): void {
    this.appendPage += 1;
    this.loadedPage.set(this.appendPage);
    this.currentPage.set(this.appendPage);
    this.loadAppend();
  }

  albumTypeLabel(value: string): string { return ALBUM_TYPE_REVERSE[value] ?? value; }

  setQuickType(type: string | null): void {
    const apiType = type ? (ALBUM_TYPE_MAP[type] ?? type) : null;
    this.activeTypes.set(apiType ? [apiType] : []);
    this.draftTypes.set(type ? [type] : []);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  activeQuickType(): string | null {
    const types = this.activeTypes();
    if (types.length !== 1) return null;
    return ALBUM_TYPE_REVERSE[types[0]] ?? types[0];
  }

  clearFilter(key: 'genre' | 'country' | 'type' | 'year' | 'label' | 'name' | 'upcoming', value?: string): void {
    if (key === 'genre') { this.activeGenreNames.update(v => value ? v.filter(x => x !== value) : []); this.draftGenres.set(this.activeGenreNames()); }
    if (key === 'country') { this.activeCountryNames.update(v => value ? v.filter(x => x !== value) : []); this.draftCountries.set(this.activeCountryNames()); }
    if (key === 'type') { this.activeTypes.update(v => value ? v.filter(x => x !== value) : []); this.draftTypes.set(this.activeTypes().map(v => ALBUM_TYPE_REVERSE[v] ?? v)); }
    if (key === 'year') { this.activeYearFrom.set(null); this.activeYearTo.set(null); this.draftYearFrom.set(this.yearMin); this.draftYearTo.set(this.yearMax); }
    if (key === 'label') { this.activeLabelNames.update(v => value ? v.filter(x => x !== value) : []); this.draftLabels.set(this.activeLabelNames()); }
    if (key === 'name') this.activeName.set(null);
    if (key === 'upcoming') { this.activeUpcoming.set(false); this.draftUpcoming.set(false); }
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  clearAllFilters(): void {
    this.activeGenreNames.set([]);
    this.activeCountryNames.set([]);
    this.activeTypes.set([]);
    this.activeLabelNames.set([]);
    this.activeYearFrom.set(null);
    this.activeYearTo.set(null);
    this.activeName.set(null);
    this.activeUpcoming.set(false);
    this.draftGenres.set([]);
    this.draftCountries.set([]);
    this.draftTypes.set([]);
    this.draftLabels.set([]);
    this.draftYearFrom.set(this.yearMin);
    this.draftYearTo.set(this.yearMax);
    this.draftUpcoming.set(false);
    this.activeRatingFrom.set(null);
    this.activeRatingTo.set(null);
    this.draftRatingFrom.set(this.ratingMin);
    this.draftRatingTo.set(this.ratingMax);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  private syncDraftsFromActive(): void {
    this.draftGenres.set([...this.activeGenreNames()]);
    this.draftCountries.set([...this.activeCountryNames()]);
    this.draftLabels.set([...this.activeLabelNames()]);
    this.draftTypes.set(this.activeTypes().map(v => ALBUM_TYPE_REVERSE[v] ?? v));
    this.draftYearFrom.set(+(this.activeYearFrom() ?? this.yearMin));
    this.draftYearTo.set(+(this.activeYearTo() ?? this.yearMax));
    this.draftUpcoming.set(this.activeUpcoming());
    this.draftRatingFrom.set(this.activeRatingFrom() ?? this.ratingMin);
    this.draftRatingTo.set(this.activeRatingTo() ?? this.ratingMax);
  }

  private updateUrl(): void {
    const params: Record<string, string | string[]> = {
      sortBy: this.activeSort(),
      sortDir: this.activeSortDir(),
      pageIndex: String(this.currentPage()),
    };
    if (this.activeName()) params['name'] = this.activeName()!;
    if (this.activeGenreNames().length) params['genreName'] = this.activeGenreNames();
    if (this.activeCountryNames().length) params['countryName'] = this.activeCountryNames();
    if (this.activeTypes().length) params['type'] = this.activeTypes();
    if (this.activeYearFrom()) params['yearFrom'] = this.activeYearFrom()!;
    if (this.activeYearTo()) params['yearTo'] = this.activeYearTo()!;
    if (this.activeLabelNames().length) params['labelName'] = this.activeLabelNames();
    if (this.activeUpcoming()) params['upcoming'] = 'true';
    if (this.activeRatingFrom()) params['ratingFrom'] = String(this.activeRatingFrom());
    if (this.activeRatingTo()) params['ratingTo'] = String(this.activeRatingTo());

    const query = Object.entries(params)
      .flatMap(([k, v]) => Array.isArray(v) ? v.map(val => `${k}=${encodeURIComponent(val)}`) : [`${k}=${encodeURIComponent(v)}`])
      .join('&');
    this.location.replaceState('/albums', query);
  }

  private load(): void {
    this.loading.set(true);
    if (this.activeUpcoming()) {
      this.albumService.getUpcoming().subscribe({
        next: (data) => { this.albums.set(data); this.total.set(data.length); this.loaded.set(true); this.loading.set(false); },
      });
      return;
    }
    if (this.activeSort() === 'Rating') {
      this.ratingService.getTopRatedAlbums({ period: 'All', pageIndex: this.currentPage() - 1, pageSize: this.pageSize, sortDir: this.activeSortDir() }).subscribe({
        next: (result) => { this.albums.set(result.data); this.total.set(result.count); this.loaded.set(true); this.loading.set(false); },
      });
      return;
    }
    this.searchService.searchAlbums(this.buildSearchParams()).subscribe({
      next: (result) => {
        this.albums.set(result.data.map(this.mapToAlbum));
        this.total.set(result.count); this.loaded.set(true); this.loading.set(false);
      }
    });
  }

  private loadAppend(): void {
    this.searchService.searchAlbums({ ...this.buildSearchParams(), pageIndex: this.appendPage - 1 }).subscribe({
      next: (result) => { this.albums.update(prev => [...prev, ...result.data.map(this.mapToAlbum)]); this.total.set(result.count); },
    });
  }

  private buildSearchParams() {
    return {
      q: this.activeName() ?? '',
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort() === 'ReleaseDate' ? 'releaseYear' : this.activeSort() === 'CreatedAt' ? 'createdAt' : 'title' as 'createdAt' | 'title' | 'releaseYear',
      sortDir: this.activeSortDir() === 'asc' ? 'Asc' : 'Desc' as 'Asc' | 'Desc',
      type: this.activeTypes()[0] ?? undefined,
      releaseYearFrom: this.activeYearFrom() ? +this.activeYearFrom()! : undefined,
      releaseYearTo: this.activeYearTo() ? +this.activeYearTo()! : undefined,
      genre: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
      country: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
    };
  }

  private mapToAlbum(doc: AlbumSearchDocument): any {
    return {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      coverUrl: doc.coverUrl,
      releaseDate: doc.releaseYear,
      type: doc.type as AlbumType,
      format: doc.format as unknown as AlbumFormat,
      bands: doc.bands.map(name => ({ id: null, name, slug: null })),
      genres: doc.genres.map(name => ({ id: null, name })),
      countries: doc.countries.map(name => ({ id: null, name })),
      tags: doc.tags.map(name => ({ id: null, name })),
      videos: [],
    };
  }
}
