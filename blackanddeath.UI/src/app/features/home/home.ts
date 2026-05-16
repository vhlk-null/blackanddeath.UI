import { Component, signal, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { DecimalPipe } from '@angular/common';
import { Section } from '../../shared/components/section/section';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import {
  TOP_RATED_TITLE,
  POPULAR_BANDS_TITLE,
  RECENTLY_ADDED_TITLE,
  UPCOMING_RELEASES_TITLE,
  TOP_RATED_TABS,
  POPULAR_BANDS_TABS,
  RECENTLY_ADDED_TABS,
  UPCOMING_RELEASES_TABS,
} from '../../shared/constants/constants';
import { SearchService, SearchPeriod } from '../services/search.service';
import { AlbumSearchDocument } from '../../shared/models/album-search-document';
import { BandSearchDocument } from '../../shared/models/band-search-document';
import { AlbumType } from '../../shared/models/enums/album-type.enum';
import { AlbumFormat } from '../../shared/models/enums/album-format.enum';

const PAGE_SIZE = 20;

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard, DecimalPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  readonly titles = {
    topRated: TOP_RATED_TITLE,
    popularBands: POPULAR_BANDS_TITLE,
    recentlyAdded: RECENTLY_ADDED_TITLE,

    upcomingReleases: UPCOMING_RELEASES_TITLE,
  };

  readonly tabs = {
    topRated: TOP_RATED_TABS,
    popularBands: POPULAR_BANDS_TABS,
    recentlyAdded: RECENTLY_ADDED_TABS,

    upcomingReleases: UPCOMING_RELEASES_TABS,
  };

  private readonly PERIODS: SearchPeriod[] = ['AllTime', 'ThisYear', 'ThisMonth'];

  loading = signal(true);
  topRatedLoading = signal(false);
  popularBandsLoading = signal(false);
  topRatedLoaded = signal(false);
  popularBandsLoaded = signal(false);

  mainTopRatedAlbums = signal<Album[]>([]);
  mainPopularBands = signal<Band[]>([]);
  mainRecentAlbums = signal<Album[]>([]);
  mainRecentBands = signal<Band[]>([]);
  recentlyAddedTab = signal(0);
  mainUpcomingReleases = signal<Album[]>([]);

  private searchService = inject(SearchService);
  private router = inject(Router);
  private titleService = inject(Title);

  totalAlbums = signal(0);
  totalBands  = signal(0);

  ngOnInit(): void {
    this.titleService.setTitle('Black And Death');

    forkJoin({
      topRatedAlbums: this.searchService.searchAlbums({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'averageRating', sortDir: 'Desc' }),
      topRatedBands: this.searchService.searchBands({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'ratingsCount', sortDir: 'Desc' }),
      albums: this.searchService.searchAlbums({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'createdAt', sortDir: 'Desc' }),
      bands: this.searchService.searchBands({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'createdAt', sortDir: 'Desc' }),
      upcomingAlbums: this.searchService.searchAlbums({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, upcoming: true }).pipe(catchError(() => of({ data: [], count: 0 }))),
    }).subscribe({
      next: ({ topRatedAlbums, topRatedBands, albums, bands, upcomingAlbums }) => {
        this.mainTopRatedAlbums.set(topRatedAlbums.data.map(this.mapToAlbum));
        this.topRatedLoaded.set(true);
        this.mainPopularBands.set(topRatedBands.data.map(this.mapToBand));
        this.popularBandsLoaded.set(true);
        this.mainRecentAlbums.set(albums.data.map(this.mapToAlbum));
        this.mainUpcomingReleases.set(upcomingAlbums.data.map(doc => ({ ...this.mapToAlbum(doc), isUpcoming: true })));
        this.mainRecentBands.set(bands.data.map(this.mapToBand));
        this.totalAlbums.set(albums.count);
        this.totalBands.set(bands.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTopRatedTabChange(index: number): void {
    const period = this.PERIODS[index] ?? 'AllTime';
    this.topRatedLoading.set(true);
    this.searchService.searchAlbums({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'averageRating', sortDir: 'Desc', period })
      .subscribe({
        next: res => { this.mainTopRatedAlbums.set(res.data.map(this.mapToAlbum)); this.topRatedLoading.set(false); this.topRatedLoaded.set(true); },
        error: () => { this.topRatedLoading.set(false); this.topRatedLoaded.set(true); },
      });
  }

  onPopularBandsTabChange(index: number): void {
    const period = this.PERIODS[index] ?? 'AllTime';
    this.popularBandsLoading.set(true);
    this.searchService.searchBands({ q: '', pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'ratingsCount', sortDir: 'Desc', period })
      .subscribe({
        next: res => { this.mainPopularBands.set(res.data.map(this.mapToBand)); this.popularBandsLoading.set(false); this.popularBandsLoaded.set(true); },
        error: () => { this.popularBandsLoading.set(false); this.popularBandsLoaded.set(true); },
      });
  }

  onRecentlyAddedTabChange(index: number): void {
    this.recentlyAddedTab.set(index);
  }

  onUpcomingReleasesTabChange(_index: number): void {}

  goToAlbums(key: string, value: string | number): void {
    this.router.navigate(['/albums'], { queryParams: { [key]: value } });
  }

  goToBands(key: string, value: string | number): void {
    this.router.navigate(['/bands'], { queryParams: { [key]: value } });
  }

  private mapToAlbum(doc: AlbumSearchDocument): Album {
    return {
      id: doc.id,
      slug: doc.slug,
      title: doc.title,
      coverUrl: doc.coverUrl,
      releaseDate: doc.releaseYear,
      type: doc.type as AlbumType,
      format: doc.format as unknown as AlbumFormat,
      bands: doc.bands.map(b => typeof b === 'string' ? { id: null, name: b, slug: null } : b) as any,
      genres: doc.genres.map(name => ({ id: null, name }) as any),
      countries: doc.countries.map(c => typeof c === 'string' ? { id: null, name: c } : { id: null, name: (c as any).name }) as any,
      tags: doc.tags.map(name => ({ id: null, name }) as any),
      videos: [],
      isExplicit: doc.isExplicit,
      isUpcoming: doc.isUpcoming,
      releaseMonth: doc.releaseMonth,
      releaseDay: doc.releaseDay,
    } as any;
  }

  private mapToBand(doc: BandSearchDocument): Band {
    return {
      id: doc.id,
      slug: doc.slug,
      name: doc.name,
      logoUrl: doc.logoUrl,
      formedYear: doc.formedYear,
      disbandedYear: doc.disbandedYear,
      status: doc.status,
      genres: doc.genres.map(name => ({ id: null, name, slug: null, isPrimary: false }) as any),
      primaryGenre: doc.genres[0] ? { id: null, name: doc.genres[0], slug: null } : null,
      countries: doc.countries.map(name => ({ id: null, name, code: null }) as any),
    } as any;
  }
}
