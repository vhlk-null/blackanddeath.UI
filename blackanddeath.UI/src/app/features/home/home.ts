import { Component, signal, inject, OnInit } from '@angular/core';
import { SlicePipe } from '@angular/common';
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

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard, SlicePipe],
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
    topRated: [this.seed.topRatedThisYear, this.seed.topRatedThisMonth, this.seed.topRatedAllTime],
    popularBands: [this.seed.popularBandsThisYear, this.seed.popularBandsAllTime],
    recentlyAdded: [this.seed.recentAlbums],
    metalVideos: [this.seed.videoClips, this.seed.videoLive, this.seed.videoPlaythroughs],
    upcomingReleases: [this.seed.upcomingFullLength, this.seed.upcomingEP, this.seed.upcomingOther],
  };

  mainTopRatedAlbums = signal<Album[]>([]);
  mainPopularBands = signal<Band[]>(this.sectionData.popularBands[0]);
  mainRecentAlbums = signal<Album[]>(this.sectionData.recentlyAdded[0]);
  mainRecentVideos = signal<Band[]>(this.sectionData.metalVideos[0]);
  mainUpcomingReleases = signal<Album[]>(this.sectionData.upcomingReleases[0]);

  private albumService = inject(AlbumService);

  ngOnInit(): void {
    this.albumService.getAll().subscribe({
      next: (albums) => {
        this.mainTopRatedAlbums.set(albums);
      }
    });
  }

  onTopRatedTabChange(index: number): void {
    this.mainTopRatedAlbums.set(this.sectionData.topRated[index]);
  }

  onPopularBandsTabChange(index: number): void {
    this.mainPopularBands.set(this.sectionData.popularBands[index]);
  }

  onRecentlyAddedTabChange(index: number): void {
    this.mainRecentAlbums.set(this.sectionData.recentlyAdded[index]);
  }

  onMetalVideosTabChange(index: number): void {
    this.mainRecentVideos.set(this.sectionData.metalVideos[index]);
  }

  onUpcomingReleasesTabChange(index: number): void {
    this.mainUpcomingReleases.set(this.sectionData.upcomingReleases[index]);
  }
}
