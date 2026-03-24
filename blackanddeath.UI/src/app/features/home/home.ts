import { Component, signal, inject, OnInit } from '@angular/core';
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
import { Seed } from '../../shared/constants/seed.data';
import { AlbumService } from '../services/album.servics';
import { BandService } from '../services/band.service';

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard],
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

  private readonly seed = new Seed();

  private readonly sectionData = {
    topRated: [this.seed.topRatedAllTime, this.seed.topRatedThisYear, this.seed.topRatedThisMonth],
    popularBands: [this.seed.popularBandsAllTime, this.seed.popularBandsThisYear],
    recentlyAdded: [this.seed.recentAlbums],
    metalVideos: [this.seed.videoClips, this.seed.videoLive, this.seed.videoPlaythroughs],
    upcomingReleases: [this.seed.upcomingFullLength, this.seed.upcomingEP, this.seed.upcomingOther],
  };

  mainTopRatedAlbums = signal<Album[]>([]);
  mainPopularBands = signal<Band[]>([]);
  mainRecentAlbums = signal<Album[]>(this.sectionData.recentlyAdded[0]);
  mainRecentVideos = signal<Band[]>([]);
  mainUpcomingReleases = signal<Album[]>(this.sectionData.upcomingReleases[0]);

  private albumService = inject(AlbumService);
  private bandService = inject(BandService);

  private allAlbums: Album[] = [];
  private allBands: Band[] = [];

  private albumsSlice(section: number, tab: number): Album[] {
    const start = (section * 3 + tab) * 4;
    return this.allAlbums.slice(start, start + 4);
  }

  private bandsSlice(section: number, tab: number): Band[] {
    const start = (section * 2 + tab) * 3;
    return this.allBands.slice(start, start + 3);
  }

  ngOnInit(): void {
    this.albumService.getAll().subscribe({
      next: (albums) => {
        this.allAlbums = albums;
        this.mainTopRatedAlbums.set(this.albumsSlice(0, 0));
        this.mainRecentAlbums.set(this.albumsSlice(1, 0));
        this.mainUpcomingReleases.set(this.albumsSlice(2, 0));
      }
    });

    this.bandService.getAll().subscribe({
      next: (bands) => {
        this.allBands = bands;
        this.mainPopularBands.set(this.bandsSlice(0, 0));
        this.mainRecentVideos.set(this.bandsSlice(1, 0));
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
    this.mainRecentAlbums.set(this.albumsSlice(1, index));
  }

  onMetalVideosTabChange(index: number): void {
    this.mainRecentVideos.set(this.bandsSlice(1, index));
  }

  onUpcomingReleasesTabChange(index: number): void {
    this.mainUpcomingReleases.set(this.albumsSlice(2, index));
  }
}
