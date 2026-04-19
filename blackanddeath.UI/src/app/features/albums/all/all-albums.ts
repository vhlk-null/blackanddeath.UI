import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.servics';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
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
  { value: 'Newest', label: 'Newest' },
  { value: 'Oldest', label: 'Oldest' },
  { value: 'ReleaseDate', label: 'Release Date' },
  { value: 'Title', label: 'Title' },
  { value: 'Rating', label: 'Rating' },
] as const;
type SortOption = typeof SORT_OPTIONS[number]['value'];
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
  private albumService = inject(AlbumService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly albumTypes = ALBUM_TYPES;
  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly labels = signal<Label[]>([]);
  readonly filtersOpen = signal(false);
  readonly showSortMenu = signal(false);

  readonly yearMin = 1950;
  readonly yearMax = new Date().getFullYear();

  // Applied (active) filters — drive URL & API
  readonly activeSort = signal<SortOption>('Newest');
  readonly activeName = signal<string | null>(null);
  readonly activeGenreNames = signal<string[]>([]);
  readonly activeCountryNames = signal<string[]>([]);
  readonly activeTypes = signal<string[]>([]);
  readonly activeYearFrom = signal<string | null>(null);
  readonly activeYearTo = signal<string | null>(null);
  readonly activeLabelNames = signal<string[]>([]);

  // Draft signals — local state inside the filter bar, not yet applied
  readonly draftGenres = signal<string[]>([]);
  readonly draftCountries = signal<string[]>([]);
  readonly draftLabels = signal<string[]>([]);
  readonly draftTypes = signal<string[]>([]);
  readonly draftYearFrom = signal<number>(this.yearMin);
  readonly draftYearTo = signal<number>(this.yearMax);

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

  readonly sortOptions = SORT_OPTIONS;
  readonly pageSize = PAGE_SIZE;

  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly currentPage = signal(1);

  ngOnInit(): void {
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));
    this.labelService.getAll().subscribe(l => this.labels.set(l));

    this.route.queryParams.subscribe(params => {
      const sort = params['sortBy'] as SortOption;
      const validSort = SORT_OPTIONS.find(o => o.value === sort);
      this.activeSort.set(validSort ? sort : 'Newest');
      this.currentPage.set(Number(params['pageIndex']) || 1);
      this.activeName.set(params['name'] ?? null);
      this.activeGenreNames.set(toArray(params['genreName']));
      this.activeCountryNames.set(toArray(params['countryName']));
      this.activeTypes.set(toArray(params['type']));
      const exactYear = params['year'] ?? null;
      this.activeYearFrom.set(exactYear ?? params['yearFrom'] ?? null);
      this.activeYearTo.set(exactYear ?? params['yearTo'] ?? null);
      this.activeLabelNames.set(toArray(params['labelName']));
      this.syncDraftsFromActive();
      this.load();
    });
  }

  toggleFilters(): void {
    if (!this.filtersOpen()) this.syncDraftsFromActive();
    this.filtersOpen.update(v => !v);
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
    this.currentPage.set(1);
    this.updateUrl();
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

  albumTypeLabel(value: string): string { return ALBUM_TYPE_REVERSE[value] ?? value; }

  clearFilter(key: 'genre' | 'country' | 'type' | 'year' | 'label' | 'name', value?: string): void {
    if (key === 'genre') { this.activeGenreNames.update(v => value ? v.filter(x => x !== value) : []); this.draftGenres.set(this.activeGenreNames()); }
    if (key === 'country') { this.activeCountryNames.update(v => value ? v.filter(x => x !== value) : []); this.draftCountries.set(this.activeCountryNames()); }
    if (key === 'type') { this.activeTypes.update(v => value ? v.filter(x => x !== value) : []); this.draftTypes.set(this.activeTypes().map(v => ALBUM_TYPE_REVERSE[v] ?? v)); }
    if (key === 'year') { this.activeYearFrom.set(null); this.activeYearTo.set(null); this.draftYearFrom.set(this.yearMin); this.draftYearTo.set(this.yearMax); }
    if (key === 'label') { this.activeLabelNames.update(v => value ? v.filter(x => x !== value) : []); this.draftLabels.set(this.activeLabelNames()); }
    if (key === 'name') this.activeName.set(null);
    this.currentPage.set(1);
    this.updateUrl();
  }

  private syncDraftsFromActive(): void {
    this.draftGenres.set([...this.activeGenreNames()]);
    this.draftCountries.set([...this.activeCountryNames()]);
    this.draftLabels.set([...this.activeLabelNames()]);
    this.draftTypes.set(this.activeTypes().map(v => ALBUM_TYPE_REVERSE[v] ?? v));
    this.draftYearFrom.set(+(this.activeYearFrom() ?? this.yearMin));
    this.draftYearTo.set(+(this.activeYearTo() ?? this.yearMax));
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: this.activeSort(),
        pageIndex: this.currentPage(),
        name: this.activeName() ?? undefined,
        genreName: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
        countryName: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
        type: this.activeTypes().length ? this.activeTypes() : undefined,
        year: null,
        yearFrom: this.activeYearFrom() ?? undefined,
        yearTo: this.activeYearTo() ?? undefined,
        labelName: this.activeLabelNames().length ? this.activeLabelNames() : undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    this.albumService.getAllPaginated({
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort(),
      name: this.activeName() ?? undefined,
      genreName: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
      countryName: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
      type: this.activeTypes().length ? this.activeTypes() : undefined,
      yearFrom: this.activeYearFrom() ?? undefined,
      yearTo: this.activeYearTo() ?? undefined,
      labelName: this.activeLabelNames().length ? this.activeLabelNames() : undefined,
    }).subscribe({
      next: (result) => {
        this.albums.set(result.data);
        this.total.set(result.count);
        this.loaded.set(true);
      },
    });
  }
}
