import { computed, inject, signal, ElementRef, HostListener, Directive } from '@angular/core';
import { GenreService } from '../../features/services/genre.service';
import { CountryService } from '../../features/services/country.service';
import { Genre } from '../models/genre';
import { Country } from '../models/country';
import { FILTER_DEBOUNCE_MS } from '../constants/constants';

export type SortDir = 'asc' | 'desc';

export const toArray = (v: string | string[] | undefined): string[] =>
  !v ? [] : Array.isArray(v) ? v : [v];

@Directive()
export abstract class FilterableListBase<TSortOption extends string> {
  protected el = inject(ElementRef);
  protected genreService = inject(GenreService);
  protected countryService = inject(CountryService);

  protected abstract sortMenuClass: string;

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.showSortMenu()) return;
    const wrap = this.el.nativeElement.querySelector(this.sortMenuClass);
    if (wrap && !wrap.contains(e.target as Node)) this.showSortMenu.set(false);
  }

  readonly genres = signal<Genre[]>([]);
  readonly countries = signal<Country[]>([]);

  readonly filtersOpen = signal(false);
  readonly showSortMenu = signal(false);
  readonly searchQuery = signal('');
  readonly searchOpen = signal(false);
  protected searchTimer: ReturnType<typeof setTimeout> | null = null;
  protected filterTimer: ReturnType<typeof setTimeout> | null = null;

  readonly yearMin = 1950;
  readonly yearMax = new Date().getFullYear();
  readonly ratingMin = 1;
  readonly ratingMax = 10;

  readonly activeSort = signal<TSortOption>('' as TSortOption);
  readonly activeSortDir = signal<SortDir>('desc');
  readonly activeName = signal<string | null>(null);
  readonly activeGenreNames = signal<string[]>([]);
  readonly activeCountryNames = signal<string[]>([]);
  readonly activeYearFrom = signal<string | null>(null);
  readonly activeYearTo = signal<string | null>(null);
  readonly activeRatingFrom = signal<number | null>(null);
  readonly activeRatingTo = signal<number | null>(null);

  readonly draftGenres = signal<string[]>([]);
  readonly draftCountries = signal<string[]>([]);
  readonly draftYearFrom = signal<number>(this.yearMin);
  readonly draftYearTo = signal<number>(this.yearMax);
  readonly draftRatingFrom = signal<number>(this.ratingMin);
  readonly draftRatingTo = signal<number>(this.ratingMax);

  readonly draftRatingFromPct = computed(() => ((this.draftRatingFrom() - this.ratingMin) / (this.ratingMax - this.ratingMin)) * 100);
  readonly draftRatingToPct = computed(() => ((this.draftRatingTo() - this.ratingMin) / (this.ratingMax - this.ratingMin)) * 100);
  readonly draftYearFromPct = computed(() => ((this.draftYearFrom() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);
  readonly draftYearToPct = computed(() => ((this.draftYearTo() - this.yearMin) / (this.yearMax - this.yearMin)) * 100);

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

  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly currentPage = signal(1);
  protected appendPage = 1;
  readonly loadedPage = signal(1);

  protected loadReferenceData(): void {
    this.genreService.getAll().subscribe(g => this.genres.set(g));
    this.countryService.getAll().subscribe(c => this.countries.set(c));
  }

  toggleSearch(): void {
    this.searchOpen.update(v => !v);
    if (!this.searchOpen() && this.searchQuery()) this.onSearch('');
  }

  toggleFilters(): void {
    if (!this.filtersOpen()) this.syncDraftsFromActive();
    this.filtersOpen.update(v => !v);
  }

  onSearch(value: string): void {
    this.searchQuery.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.activeName.set(value.trim() || null);
      this.currentPage.set(1);
      this.updateUrl();
      this.load();
    }, FILTER_DEBOUNCE_MS);
  }

  onSortChange(sort: TSortOption): void {
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

  scheduleApply(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => this.applyFilters(), FILTER_DEBOUNCE_MS);
  }

  onDraftYearFrom(value: string): void {
    const v = +value;
    this.draftYearFrom.set(v >= this.draftYearTo() ? this.draftYearTo() - 1 : v);
  }

  onDraftYearTo(value: string): void {
    const v = +value;
    this.draftYearTo.set(v <= this.draftYearFrom() ? this.draftYearFrom() + 1 : v);
  }

  onDraftRatingFrom(value: string): void {
    const v = +value;
    this.draftRatingFrom.set(v >= this.draftRatingTo() ? this.draftRatingTo() - 1 : v);
  }

  onDraftRatingTo(value: string): void {
    const v = +value;
    this.draftRatingTo.set(v <= this.draftRatingFrom() ? this.draftRatingFrom() + 1 : v);
  }

  protected syncDraftsFromActive(): void {
    this.draftGenres.set([...this.activeGenreNames()]);
    this.draftCountries.set([...this.activeCountryNames()]);
    this.draftYearFrom.set(+(this.activeYearFrom() ?? this.yearMin));
    this.draftYearTo.set(+(this.activeYearTo() ?? this.yearMax));
    this.draftRatingFrom.set(this.activeRatingFrom() ?? this.ratingMin);
    this.draftRatingTo.set(this.activeRatingTo() ?? this.ratingMax);
  }

  protected abstract load(): void;
  protected abstract loadAppend(): void;
  protected abstract applyFilters(): void;
  protected abstract updateUrl(): void;
}
