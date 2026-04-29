import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { take } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { AlbumService } from '../../services/album.servics';
import { SearchService } from '../../services/search.service';
import { AlbumSearchDocument } from '../../../shared/models/album-search-document';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { AlbumFormat } from '../../../shared/models/enums/album-format.enum';
import { LabelService } from '../../services/label.service';
import { Album } from '../../../shared/models/album';
import { Label } from '../../../shared/models/label';
import { AlbumCard } from '../card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { MultiSelectNames } from '../../../shared/components/multi-select-names/multi-select-names';
import { FilterableListBase, toArray } from '../../../shared/base/filterable-list.base';

const SORT_OPTIONS = [
  { value: 'CreatedAt', label: 'Recently Added' },
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
export class AllAlbums extends FilterableListBase<SortOption> implements OnInit {
  protected override sortMenuClass = '.all-albums__sort-wrap';

  private albumService = inject(AlbumService);
  private searchService = inject(SearchService);
  private labelService = inject(LabelService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private titleService = inject(Title);

  readonly albumTypes = ALBUM_TYPES;
  readonly sortOptions = SORT_OPTIONS;
  readonly labels = signal<Label[]>([]);
  readonly activeLabelNames = signal<string[]>([]);
  readonly activeTypes = signal<string[]>([]);
  readonly activeUpcoming = signal<boolean>(false);
  readonly includeTracksEnabled = signal(false);
  readonly draftLabels = signal<string[]>([]);
  readonly draftTypes = signal<string[]>([]);
  readonly draftUpcoming = signal<boolean>(false);
  readonly labelNames = signal<string[]>([]);
  readonly albums = signal<Album[]>([]);
  readonly pageSize = PAGE_SIZE;
  readonly skeletonItems = Array(PAGE_SIZE).fill(0);

  ngOnInit(): void {
    this.titleService.setTitle('Albums — Black And Death');
    this.loadReferenceData();
    this.labelService.getAll().subscribe(l => { this.labels.set(l); this.labelNames.set(l.map(x => x.name)); });

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

  applyFilterFromCard(key: 'genre' | 'country' | 'type' | 'year', value: string | number): void {
    this.currentPage.set(1);
    switch (key) {
      case 'genre': this.activeGenreNames.set([value as string]); break;
      case 'country': this.activeCountryNames.set([value as string]); break;
      case 'type': this.activeTypes.set([value as string]); break;
      case 'year': this.activeYearFrom.set(String(value)); this.activeYearTo.set(String(value)); break;
    }
    this.updateUrl();
    this.load();
  }

  toggleIncludeTracks(): void {
    this.includeTracksEnabled.update(v => !v);
    this.currentPage.set(1);
    this.load();
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

  protected override syncDraftsFromActive(): void {
    super.syncDraftsFromActive();
    this.draftLabels.set([...this.activeLabelNames()]);
    this.draftTypes.set(this.activeTypes().map(v => ALBUM_TYPE_REVERSE[v] ?? v));
    this.draftUpcoming.set(this.activeUpcoming());
  }

  protected override applyFilters(): void {
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

  protected override updateUrl(): void {
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

  protected override load(): void {
    this.loading.set(true);
    const done = () => this.loading.set(false);
    if (this.activeUpcoming()) {
      this.albumService.getUpcoming().subscribe({
        next: (data) => { this.albums.set(data); this.total.set(data.length); this.loaded.set(true); done(); },
        error: done,
      });
      return;
    }
    this.searchService.searchAlbums(this.buildSearchParams()).subscribe({
      next: (result) => { this.albums.set(result.data.map(this.mapToAlbum)); this.total.set(result.count); this.loaded.set(true); done(); },
      error: done,
    });
  }

  protected override loadAppend(): void {
    this.searchService.searchAlbums({ ...this.buildSearchParams(), pageIndex: this.appendPage - 1 }).subscribe({
      next: (result) => { this.albums.update(prev => [...prev, ...result.data.map(this.mapToAlbum)]); this.total.set(result.count); },
    });
  }

  private buildSearchParams() {
    return {
      q: this.activeName() ?? '',
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort() === 'ReleaseDate' ? 'releaseYear' : this.activeSort() === 'CreatedAt' ? 'createdAt' : this.activeSort() === 'Rating' ? 'averageRating' : 'title' as 'createdAt' | 'title' | 'releaseYear' | 'averageRating',
      sortDir: this.activeSortDir() === 'asc' ? 'Asc' : 'Desc' as 'Asc' | 'Desc',
      type: this.activeTypes()[0] ?? undefined,
      releaseYearFrom: this.activeYearFrom() ? +this.activeYearFrom()! : undefined,
      releaseYearTo: this.activeYearTo() ? +this.activeYearTo()! : undefined,
      genre: this.activeGenreNames().length ? this.activeGenreNames() : undefined,
      country: this.activeCountryNames().length ? this.activeCountryNames() : undefined,
      includeTracks: this.includeTracksEnabled() ? true : undefined,
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
      bands: doc.bands.map(b => typeof b === 'string' ? { id: null, name: b, slug: null } : b),
      genres: doc.genres.map(name => ({ id: null, name })),
      countries: doc.countries.map(c => typeof c === 'string' ? { id: null, name: c } : { id: null, name: (c as any).name }),
      tags: doc.tags.map(name => ({ id: null, name })),
      videos: [],
      averageRating: doc.averageRating,
      ratingsCount: doc.ratingsCount,
    };
  }
}
