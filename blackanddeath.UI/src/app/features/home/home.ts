import { Component, signal, computed } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';
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

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {


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

  readonly tabIndex = {
    topRated: signal(0),
    popularBands: signal(0),
    recentlyAdded: signal(0),
    metalVideos: signal(0),
    upcomingReleases: signal(0),
  };

  mainTopRatedAlbums = computed(() => this.sectionData.topRated[this.tabIndex.topRated()]);
  mainPopularBands = computed(() => this.sectionData.popularBands[this.tabIndex.popularBands()]);
  mainRecentAlbums = computed(() => this.sectionData.recentlyAdded[this.tabIndex.recentlyAdded()]);
  mainRecentVideos = computed(() => this.sectionData.metalVideos[this.tabIndex.metalVideos()]);
  mainUpcomingReleases = computed(() => this.sectionData.upcomingReleases[this.tabIndex.upcomingReleases()]);

  private readonly seed = new Seed();

  readonly sectionData = {
    topRated: [this.seed.topRatedThisYear, this.seed.topRatedThisMonth, this.seed.topRatedAllTime],
    popularBands: [this.seed.popularBandsThisYear, this.seed.popularBandsAllTime],
    recentlyAdded: [this.seed.recentAlbums],
    metalVideos: [this.seed.videoClips, this.seed.videoLive, this.seed.videoPlaythroughs],
    upcomingReleases: [this.seed.upcomingFullLength, this.seed.upcomingEP, this.seed.upcomingOther],
  };

}
