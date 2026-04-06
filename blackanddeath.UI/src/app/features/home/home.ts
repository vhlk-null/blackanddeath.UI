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


  private allAlbums: Album[] = [];
  private allBands: Band[] = [];
  private allVideos: VideoBand[] = [];

  private albumsSlice(section: number, tab: number): Album[] {
    const start = (section * 3 + tab) * 4;
    return this.allAlbums.slice(start, start + 4);
  }

  private bandsSlice(section: number, tab: number): Band[] {
    const start = (section * 2 + tab) * 3;
    return this.allBands.slice(start, start + 3);
  }

  ngOnInit(): void {
    forkJoin({
      albums: this.albumService.getAll({ pageIndex: 0, pageSize: 20, sortBy: 'Newest' }),
      bands: this.bandService.getAll({ pageIndex: 0, pageSize: 9, sortBy: 'Newest' }),
      videos: this.videoBandService.getAll({ pageIndex: 0, pageSize: 9 }).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ albums, bands, videos }) => {
        this.allAlbums = albums;
        this.mainTopRatedAlbums.set(this.albumsSlice(0, 0));
        this.mainRecentAlbums.set(albums.slice(0, 4));
        this.mainUpcomingReleases.set(this.albumsSlice(2, 0));

        this.allBands = bands;
        this.mainPopularBands.set(this.bandsSlice(0, 0));
        this.mainRecentBands.set(bands.slice(0, 3));

        this.allVideos = videos;
        this.mainRecentVideos.set(videos.slice(0, 3));

        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onTopRatedTabChange(index: number): void {
    this.mainTopRatedAlbums.set(this.albumsSlice(0, index));
  }

  onPopularBandsTabChange(index: number): void {
    this.mainPopularBands.set(this.bandsSlice(0, index));
  }

  onRecentlyAddedTabChange(index: number): void {
    this.recentlyAddedTab.set(index);
  }

  onMetalVideosTabChange(index: number): void {
    const types = ['Clip', 'Live', 'Playthrough'];
    const filtered = this.allVideos.filter(v => v.videoType === types[index]);
    this.mainRecentVideos.set(filtered.slice(0, 3));
  }

  onUpcomingReleasesTabChange(index: number): void {
    this.mainUpcomingReleases.set(this.albumsSlice(2, index));
  }
}
