import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BandService } from '../../services/band.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { RatingService } from '../../services/rating.service';
import { Band } from '../../../shared/models/band';
import { Genre } from '../../../shared/models/genre';
import { Country } from '../../../shared/models/country';
import { BandCard } from '../band-card/band-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { MultiSelectNames } from '../../../shared/components/multi-select-names/multi-select-names';

const toArray = (v: string | string[] | undefined): string[] =>
  !v ? [] : Array.isArray(v) ? v : [v];

const SORT_OPTIONS = ['Newest', 'Oldest', 'Name', 'Rating'] as const;
type SortOption = typeof SORT_OPTIONS[number];
const PAGE_SIZE = 9;
const BAND_STATUSES = ['Active', 'Split-up', 'On hold', 'Changed name', 'Unknown'];

@Component({
  selector: 'app-all-bands',
  templateUrl: './all-bands.html',
  styleUrl: './all-bands.scss',
  imports: [BandCard, Pagination, MultiSelectNames],
})
export class AllBands implements OnInit {
  private bandService = inject(BandService);
  private ratingService = inject(RatingService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly bandStatuses = BAND_STATUSES;
  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);
  readonly filtersOpen = signal(false);
  readonly showSortMenu = signal(false);

  readonly yearMin = 1950;
  readonly yearMax = new Date().getFullYear();

  // Applied filters
  readonly activeSort = signal<SortOption>('Newest');
  readonly activeGenreNames = signal<string[]>([]);
  readonly activeCountryNames = signal<string[]>([]);
  readonly activeStatuses = signal<string[]>([]);
  readonly activeYearFrom = signal<string | null>(null);
  readonly activeYearTo = signal<string | null>(null);

  // Draft signals
  readonly draftGenres = signal<string[]>([]);
  readonly draftCountries = signal<string[]>([]);
  readonly draftStatuses = signal<string[]>([]);
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

  readonly draftYearFromPct = computed(() => ((this.draftYearFrom() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);
  readonly draftYearToPct = computed(() => ((this.draftYearTo() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);

  readonly sortOptions = SORT_OPTIONS;
  readonly pageSize = PAGE_SIZE;

  readonly bands = signal<Band[]>([]);
  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly currentPage = signal(1);

  ngOnInit(): void {
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));

    this.route.queryParams.subscribe(params => {
      const sort = params['sortBy'] as SortOption;
      this.activeSort.set(SORT_OPTIONS.includes(sort) ? sort : 'Newest');
      this.currentPage.set(Number(params['pageIndex']) || 1);
      this.activeGenreNames.set(toArray(params['genreName']));
      this.activeCountryNames.set(toArray(params['countryName']));
      this.activeStatuses.set(toArray(params['status']));
      this.activeYearFrom.set(params['yearFrom'] ?? null);
      this.activeYearTo.set(params['yearTo'] ?? null);
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
    this.activeStatuses.set(this.draftStatuses());
    const fromChanged = this.draftYearFrom() !== this.yearMin;
    const toChanged = this.draftYearTo() !== this.yearMax;
    this.activeYearFrom.set(fromChanged || toChanged ? String(this.draftYearFrom()) : null);
    this.activeYearTo.set(fromChanged || toChanged ? String(this.draftYearTo()) : null);
    this.currentPage.set(1);
    this.updateUrl();
  }

  clearFilter(key: 'genre' | 'country' | 'status' | 'year', value?: string): void {
    if (key === 'genre') { this.activeGenreNames.update(v => value ? v.filter(x => x !== value) : []); this.draftGenres.set(this.activeGenreNames()); }
    if (key === 'country') { this.activeCountryNames.update(v => value ? v.filter(x => x !== value) : []); this.draftCountries.set(this.activeCountryNames()); }
    if (key === 'status') { this.activeStatuses.update(v => value ? v.filter(x => x !== value) : []); this.draftStatuses.set(this.activeStatuses()); }
    if (key === 'year') { this.activeYearFrom.set(null); this.activeYearTo.set(null); this.draftYearFrom.set(this.yearMin); this.draftYearTo.set(this.yearMax); }
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

  private syncDraftsFromActive(): void {
    this.draftGenres.set([...this.activeGenreNames()]);
    this.draftCountries.set([...this.activeCountryNames()]);
    this.draftStatuses.set([...this.activeStatuses()]);
    this.draftYearFrom.set(+(this.activeYearFrom() ?? this.yearMin));
    this.draftYearTo.set(+(this.activeYearTo() ?? this.yearMax));
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: this.activeSort(),
        pageIndex: this.currentPage(),
        genreName: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
        countryName: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
        status: this.activeStatuses().length ? this.activeStatuses() : undefined,
        yearFrom: this.activeYearFrom() ?? undefined,
        yearTo: this.activeYearTo() ?? undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    if (this.activeSort() === 'Rating') {
      this.ratingService.getTopRatedBands({ period: 'All', pageIndex: this.currentPage() - 1, pageSize: this.pageSize }).subscribe({
        next: (result) => {
          this.bands.set(result.data);
          this.total.set(result.count);
          this.loaded.set(true);
        },
      });
      return;
    }
    this.bandService.getAllPaginated({
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort(),
      genreName: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
      countryName: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
      status: this.activeStatuses().length ? this.activeStatuses() : undefined,
      yearFrom: this.activeYearFrom() ?? undefined,
      yearTo: this.activeYearTo() ?? undefined,
    }).subscribe({
      next: (result) => {
        this.bands.set(result.data);
        this.total.set(result.count);
        this.loaded.set(true);
      },
    });
  }
}
