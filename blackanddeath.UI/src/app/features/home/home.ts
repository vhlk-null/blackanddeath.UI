import { Component, signal, inject, OnInit } from '@angular/core';
import { forkJoin, of, catchError } from 'rxjs';
import { Section } from '../../shared/components/section/section';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import {
  TOP_RATED_TITLE,
  POPULAR_BANDS_TITLE,
  RECENTLY_ADDED_TITLE,
  METAL_VIDEOS_TITLE,
  UPCOMING_RELEASES_TITLE,
  TOP_RATED_TABS,
  POPULAR_BANDS_TABS,
  RECENTLY_ADDED_TABS,
  METAL_VIDEOS_TABS,
  UPCOMING_RELEASES_TABS,
} from '../../shared/constants/constants';
import { AlbumService } from '../services/album.servics';
import { BandService } from '../services/band.service';
import { VideoBandService } from '../services/video-band.service';
import { RatingService } from '../services/rating.service';
import { VideoBand } from '../../shared/models/video-band';
import { VideoCard } from './video-card/video-card';

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard, VideoCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  readonly titles = {
    topRated: TOP_RATED_TITLE,
    popularBands: POPULAR_BANDS_TITLE,
    recentlyAdded: RECENTLY_ADDED_TITLE,
    metalVideos: METAL_VIDEOS_TITLE,
    upcomingReleases: UPCOMING_RELEASES_TITLE,
  };

  readonly tabs = {
    topRated: TOP_RATED_TABS,
    popularBands: POPULAR_BANDS_TABS,
    recentlyAdded: RECENTLY_ADDED_TABS,
    metalVideos: METAL_VIDEOS_TABS,
    upcomingReleases: UPCOMING_RELEASES_TABS,
  };

  loading = signal(true);

  mainTopRatedAlbums = signal<Album[]>([]);
  mainPopularBands = signal<Band[]>([]);
  mainRecentAlbums = signal<Album[]>([]);
  mainRecentBands = signal<Band[]>([]);
  recentlyAddedTab = signal(0);
  mainRecentVideos = signal<VideoBand[]>([]);
  mainUpcomingReleases = signal<Album[]>([]);

  private albumService = inject(AlbumService);
  private bandService = inject(BandService);
  private videoBandService = inject(VideoBandService);
  private ratingService = inject(RatingService);

  private readonly PAGE_SIZE = { albums: 50, bands: 30, videos: 30 };

  private pages = {
    topRatedAlbums: 0,
    popularBands: 0,
    recentAlbums: 0,
    recentBands: 0,
    videos: 0,
  };

  private loading$ = {
    topRatedAlbums: false,
    popularBands: false,
    recentAlbums: false,
    recentBands: false,
    videos: false,
  };

  private topRatedPeriod = 'All';
  private popularBandsPeriod = 'All';

  private allVideos: VideoBand[] = [];



  ngOnInit(): void {
    forkJoin({
      topRatedAlbums: this.ratingService.getTopRatedAlbums({ period: 'All', pageIndex: 0, pageSize: 50 }),
      topRatedBands: this.ratingService.getTopRatedBands({ period: 'All', pageIndex: 0, pageSize: 30 }),
      albums: this.albumService.getAll({ pageIndex: 0, pageSize: 50, sortBy: 'Newest' }),
      bands: this.bandService.getAll({ pageIndex: 0, pageSize: 30, sortBy: 'Newest' }),
      videos: this.videoBandService.getAll({ pageIndex: 0, pageSize: 30 }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ topRatedAlbums, topRatedBands, albums, bands, videos }) => {
        this.mainTopRatedAlbums.set(topRatedAlbums);

        this.mainPopularBands.set(topRatedBands);

        this.mainRecentAlbums.set(albums);
        this.mainUpcomingReleases.set(albums.slice(8));

        this.mainRecentBands.set(bands);

        this.allVideos = videos;
        this.mainRecentVideos.set(videos);

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  private readonly periodMap = ['All', 'Year', 'Month'];

  onTopRatedTabChange(index: number): void {
    const period = this.periodMap[index];
    this.topRatedPeriod = period;
    this.pages.topRatedAlbums = 0;
    this.ratingService.getTopRatedAlbums({ period, pageIndex: 0, pageSize: this.PAGE_SIZE.albums })
      .subscribe(albums => this.mainTopRatedAlbums.set(albums));
  }

  onTopRatedLoadMore(): void {
    if (this.loading$.topRatedAlbums) return;
    this.loading$.topRatedAlbums = true;
    const nextPage = this.pages.topRatedAlbums + 1;
    this.ratingService.getTopRatedAlbums({ period: this.topRatedPeriod, pageIndex: nextPage, pageSize: this.PAGE_SIZE.albums })
      .subscribe(albums => {
        if (albums.length) {
          this.pages.topRatedAlbums = nextPage;
          this.mainTopRatedAlbums.update(prev => [...prev, ...albums]);
        }
        this.loading$.topRatedAlbums = false;
      });
  }

  onPopularBandsTabChange(index: number): void {
    const period = this.periodMap[index];
    this.popularBandsPeriod = period;
    this.pages.popularBands = 0;
    this.ratingService.getTopRatedBands({ period, pageIndex: 0, pageSize: this.PAGE_SIZE.bands })
      .subscribe(bands => this.mainPopularBands.set(bands));
  }

  onPopularBandsLoadMore(): void {
    if (this.loading$.popularBands) return;
    this.loading$.popularBands = true;
    const nextPage = this.pages.popularBands + 1;
    this.ratingService.getTopRatedBands({ period: this.popularBandsPeriod, pageIndex: nextPage, pageSize: this.PAGE_SIZE.bands })
      .subscribe(bands => {
        if (bands.length) {
          this.pages.popularBands = nextPage;
          this.mainPopularBands.update(prev => [...prev, ...bands]);
        }
        this.loading$.popularBands = false;
      });
  }

  onRecentlyAddedTabChange(index: number): void {
    this.recentlyAddedTab.set(index);
  }

  onRecentAlbumsLoadMore(): void {
    if (this.loading$.recentAlbums) return;
    this.loading$.recentAlbums = true;
    const nextPage = this.pages.recentAlbums + 1;
    this.albumService.getAll({ pageIndex: nextPage, pageSize: this.PAGE_SIZE.albums, sortBy: 'Newest' })
      .subscribe(albums => {
        if (albums.length) {
          this.pages.recentAlbums = nextPage;
          this.mainRecentAlbums.update(prev => [...prev, ...albums]);
        }
        this.loading$.recentAlbums = false;
      });
  }

  onRecentBandsLoadMore(): void {
    if (this.loading$.recentBands) return;
    this.loading$.recentBands = true;
    const nextPage = this.pages.recentBands + 1;
    this.bandService.getAll({ pageIndex: nextPage, pageSize: this.PAGE_SIZE.bands, sortBy: 'Newest' })
      .subscribe(bands => {
        if (bands.length) {
          this.pages.recentBands = nextPage;
          this.mainRecentBands.update(prev => [...prev, ...bands]);
        }
        this.loading$.recentBands = false;
      });
  }

  onRecentlyAddedLoadMore(): void {
    if (this.recentlyAddedTab() === 0) {
      this.onRecentAlbumsLoadMore();
    } else {
      this.onRecentBandsLoadMore();
    }
  }

  onMetalVideosTabChange(index: number): void {
    const types = ['Clip', 'Live', 'Playthrough'];
    const filtered = this.allVideos.filter(v => v.videoType === types[index]);
    this.mainRecentVideos.set(filtered);
  }

  onVideosLoadMore(): void {
    if (this.loading$.videos) return;
    this.loading$.videos = true;
    const nextPage = this.pages.videos + 1;
    this.videoBandService.getAll({ pageIndex: nextPage, pageSize: this.PAGE_SIZE.videos })
      .pipe(catchError(() => of([])))
      .subscribe(videos => {
        if (videos.length) {
          this.pages.videos = nextPage;
          this.allVideos = [...this.allVideos, ...videos];
          this.mainRecentVideos.update(prev => [...prev, ...videos]);
        }
        this.loading$.videos = false;
      });
  }

  onUpcomingReleasesTabChange(_index: number): void {
    this.mainUpcomingReleases.set(this.mainRecentAlbums().slice(8));
  }
}
