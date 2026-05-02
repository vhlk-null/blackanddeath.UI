import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { BandSearchDocument } from '../../../shared/models/band-search-document';
import { Band } from '../../../shared/models/band';
import { BandCard } from '../band-card/band-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { MultiSelectNames } from '../../../shared/components/multi-select-names/multi-select-names';
import { FilterableListBase, toArray } from '../../../shared/base/filterable-list.base';

const SORT_OPTIONS = [
  { value: 'CreatedAt', label: 'Recently Added' },
  { value: 'FormedYear', label: 'Formation Year' },
  { value: 'Name', label: 'Name' },
  { value: 'Rating', label: 'Rating' },
] as const;
type SortOption = typeof SORT_OPTIONS[number]['value'];

const PAGE_SIZE = 9;
const BAND_STATUSES = ['Active', 'Split-up', 'On hold', 'Changed name', 'Unknown'];

@Component({
  selector: 'app-all-bands',
  templateUrl: './all-bands.html',
  styleUrl: './all-bands.scss',
  imports: [BandCard, Pagination, MultiSelectNames],
})
export class AllBands extends FilterableListBase<SortOption> implements OnInit {
  protected override sortMenuClass = '.all-bands__sort-wrap';

  private searchService = inject(SearchService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);

  readonly bandStatuses = BAND_STATUSES;
  readonly sortOptions = SORT_OPTIONS;
  readonly activeStatuses = signal<string[]>([]);
  readonly draftStatuses = signal<string[]>([]);
  readonly bands = signal<Band[]>([]);
  readonly pageSize = PAGE_SIZE;
  readonly skeletonItems = Array(PAGE_SIZE).fill(0);

  ngOnInit(): void {
    this.titleService.setTitle('Bands — Black And Death');
    this.loadReferenceData();

    this.route.queryParams.subscribe(params => {
      const sort = params['sortBy'] as SortOption;
      this.activeSort.set(SORT_OPTIONS.find(o => o.value === sort) ? sort : 'CreatedAt');
      this.activeSortDir.set(params['sortDir'] === 'asc' ? 'asc' : 'desc');
      this.currentPage.set(Number(params['pageIndex']) || 1);
      this.activeName.set(params['name'] ?? null);
      this.searchQuery.set(params['name'] ?? '');
      this.activeGenreNames.set(toArray(params['genreName']));
      this.activeCountryNames.set(toArray(params['countryName']));
      this.activeStatuses.set(toArray(params['status']));
      this.activeYearFrom.set(params['yearFrom'] ?? null);
      this.activeYearTo.set(params['yearTo'] ?? null);
      this.activeRatingFrom.set(params['ratingFrom'] ? +params['ratingFrom'] : null);
      this.activeRatingTo.set(params['ratingTo'] ? +params['ratingTo'] : null);
      this.syncDraftsFromActive();
      this.appendPage = this.currentPage();
      this.loadedPage.set(this.currentPage());
      this.load();
    });
  }

  applyFilterFromCard(key: 'genre' | 'country' | 'year', value: string | number): void {
    this.currentPage.set(1);
    switch (key) {
      case 'genre': this.activeGenreNames.set([value as string]); break;
      case 'country': this.activeCountryNames.set([value as string]); break;
      case 'year': this.activeYearFrom.set(String(value)); this.activeYearTo.set(String(value)); break;
    }
    this.syncDraftsFromActive();
    this.filtersOpen.set(true);
    this.updateUrl();
    this.load();
  }

  setQuickStatus(status: string | null): void {
    this.activeStatuses.set(status ? [status] : []);
    this.draftStatuses.set(status ? [status] : []);
    this.currentPage.set(1);
    this.updateUrl();
  }

  activeQuickStatus(): string | null {
    const s = this.activeStatuses();
    return s.length === 1 ? s[0] : null;
  }

  clearFilter(key: 'genre' | 'country' | 'status' | 'year' | 'name', value?: string): void {
    if (key === 'name') { this.activeName.set(null); this.searchQuery.set(''); }
    if (key === 'genre') { this.activeGenreNames.update(v => value ? v.filter(x => x !== value) : []); this.draftGenres.set(this.activeGenreNames()); }
    if (key === 'country') { this.activeCountryNames.update(v => value ? v.filter(x => x !== value) : []); this.draftCountries.set(this.activeCountryNames()); }
    if (key === 'status') { this.activeStatuses.update(v => value ? v.filter(x => x !== value) : []); this.draftStatuses.set(this.activeStatuses()); }
    if (key === 'year') { this.activeYearFrom.set(null); this.activeYearTo.set(null); this.draftYearFrom.set(this.yearMin); this.draftYearTo.set(this.yearMax); }
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  clearAllFilters(): void {
    this.activeGenreNames.set([]);
    this.activeCountryNames.set([]);
    this.activeStatuses.set([]);
    this.activeYearFrom.set(null);
    this.activeYearTo.set(null);
    this.activeRatingFrom.set(null);
    this.activeRatingTo.set(null);
    this.draftGenres.set([]);
    this.draftCountries.set([]);
    this.draftStatuses.set([]);
    this.draftYearFrom.set(this.yearMin);
    this.draftYearTo.set(this.yearMax);
    this.draftRatingFrom.set(this.ratingMin);
    this.draftRatingTo.set(this.ratingMax);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  protected override syncDraftsFromActive(): void {
    super.syncDraftsFromActive();
    this.draftStatuses.set([...this.activeStatuses()]);
  }

  protected override applyFilters(): void {
    this.activeGenreNames.set(this.draftGenres());
    this.activeCountryNames.set(this.draftCountries());
    this.activeStatuses.set(this.draftStatuses());
    const fromChanged = this.draftYearFrom() !== this.yearMin;
    const toChanged = this.draftYearTo() !== this.yearMax;
    this.activeYearFrom.set(fromChanged || toChanged ? String(this.draftYearFrom()) : null);
    this.activeYearTo.set(fromChanged || toChanged ? String(this.draftYearTo()) : null);
    const ratingFromChanged = this.draftRatingFrom() !== this.ratingMin;
    const ratingToChanged = this.draftRatingTo() !== this.ratingMax;
    this.activeRatingFrom.set(ratingFromChanged || ratingToChanged ? this.draftRatingFrom() : null);
    this.activeRatingTo.set(ratingFromChanged || ratingToChanged ? this.draftRatingTo() : null);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  protected override updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sortBy: this.activeSort(),
        sortDir: this.activeSortDir(),
        pageIndex: this.currentPage(),
        name: this.activeName() ?? undefined,
        genreName: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
        countryName: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
        status: this.activeStatuses().length ? this.activeStatuses() : undefined,
        yearFrom: this.activeYearFrom() ?? undefined,
        yearTo: this.activeYearTo() ?? undefined,
        ratingFrom: this.activeRatingFrom() ?? undefined,
        ratingTo: this.activeRatingTo() ?? undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  protected override load(): void {
    this.loading.set(true);
    const done = () => this.loading.set(false);
    this.searchService.searchBands(this.buildSearchParams()).subscribe({
      next: (result) => { this.bands.set(result.data.map(this.mapToBand)); this.total.set(result.count); this.loaded.set(true); done(); },
      error: done,
    });
  }

  protected override loadAppend(): void {
    this.searchService.searchBands({ ...this.buildSearchParams(), pageIndex: this.appendPage - 1 }).subscribe({
      next: (result) => { this.bands.update(prev => [...prev, ...result.data.map(this.mapToBand)]); this.total.set(result.count); },
    });
  }

  private buildSearchParams() {
    return {
      q: this.activeName() ?? '',
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort() === 'Name' ? 'name' : this.activeSort() === 'FormedYear' ? 'formedYear' : this.activeSort() === 'Rating' ? 'averageRating' : 'createdAt' as 'createdAt' | 'name' | 'formedYear' | 'averageRating',
      sortDir: this.activeSortDir() === 'asc' ? 'Asc' : 'Desc' as 'Asc' | 'Desc',
      status: this.activeStatuses()[0] ?? undefined,
      formedYearFrom: this.activeYearFrom() ? +this.activeYearFrom()! : undefined,
      formedYearTo: this.activeYearTo() ? +this.activeYearTo()! : undefined,
      genre: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
      country: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
    };
  }

  private mapToBand(doc: BandSearchDocument): any {
    return {
      id: doc.id,
      slug: doc.slug,
      name: doc.name,
      logoUrl: doc.logoUrl,
      formedYear: doc.formedYear,
      disbandedYear: doc.disbandedYear,
      status: doc.status,
      genres: doc.genres.map(name => ({ id: null, name, slug: null, isPrimary: false })),
      primaryGenre: doc.genres[0] ? { id: null, name: doc.genres[0], slug: null } : null,
      countries: doc.countries.map(name => ({ id: null, name, code: null })),
    };
  }
}
