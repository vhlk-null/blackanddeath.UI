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

const PAGE_SIZE = 20;

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

  private readonly periodMap = ['All', 'Year', 'Month'];

  ngOnInit(): void {
    forkJoin({
      topRatedAlbums: this.ratingService.getTopRatedAlbums({ period: 'All', pageIndex: 0, pageSize: PAGE_SIZE }),
      topRatedBands: this.ratingService.getTopRatedBands({ period: 'All', pageIndex: 0, pageSize: PAGE_SIZE }),
      albums: this.albumService.getAll({ pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'Newest' }),
      bands: this.bandService.getAll({ pageIndex: 0, pageSize: PAGE_SIZE, sortBy: 'Newest' }),
      videos: this.videoBandService.getAll({ pageIndex: 0, pageSize: PAGE_SIZE }).pipe(catchError(() => of([]))),
      upcomingAlbums: this.albumService.getUpcoming({ pageSize: PAGE_SIZE }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ topRatedAlbums, topRatedBands, albums, bands, videos, upcomingAlbums }) => {
        this.mainTopRatedAlbums.set(topRatedAlbums.data);
        this.mainPopularBands.set(topRatedBands.data);
        this.mainRecentAlbums.set(albums);
        this.mainUpcomingReleases.set(upcomingAlbums);
        this.mainRecentBands.set(bands);
        this.mainRecentVideos.set(videos);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onTopRatedTabChange(index: number): void {
    this.ratingService.getTopRatedAlbums({ period: this.periodMap[index], pageIndex: 0, pageSize: PAGE_SIZE })
      .subscribe(r => this.mainTopRatedAlbums.set(r.data));
  }

  onPopularBandsTabChange(index: number): void {
    this.ratingService.getTopRatedBands({ period: this.periodMap[index], pageIndex: 0, pageSize: PAGE_SIZE })
      .subscribe(r => this.mainPopularBands.set(r.data));
  }

  onRecentlyAddedTabChange(index: number): void {
    this.recentlyAddedTab.set(index);
  }

  onMetalVideosTabChange(_index: number): void {
    this.videoBandService.getAll({ pageIndex: 0, pageSize: PAGE_SIZE })
      .pipe(catchError(() => of([])))
      .subscribe(videos => this.mainRecentVideos.set(videos));
  }

  onUpcomingReleasesTabChange(_index: number): void {}
}
