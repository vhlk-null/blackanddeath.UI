import { Component, computed, signal } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../../albums/card/album-card';
import { BandCard } from '../band-card/band-card';
import { Seed } from '../../../shared/constants/seed.data';
import {
  BAND_INFORMATION,
  DISCOGRAPHY_TITLE,
  VIDEOS_TITLE,
  SIMILAR_BANDS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-band-info',
  imports: [Section, AlbumCard, BandCard],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class BandInfo {

  readonly tabs = {
    info: BAND_INFORMATION,
  };

  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    videos: VIDEOS_TITLE,
    similarBands: SIMILAR_BANDS_TITLE,
  };

  readonly infoTabIndex = signal(0);
  readonly tracklistTabIndex = signal(0);
  readonly discographyTabIndex = signal(0);
  readonly similarBandsTabIndex = signal(0);

  readonly band = {
    name: 'Sarcophagum',
    coverImage: 'images/bands-logo/photo_1_2026-03-16_00-40-58.jpg',
    country: 'Ireland',
    city: 'Dublin',
    status: 'Active',
    genre: 'Black Death Metal',
    label: '20 Buck Spin',
    formedIn: 2015,
    rating: 8,
    maxRating: 9,
  };

  readonly stars = Array.from({ length: this.band.maxRating }, (_, i) => i < this.band.rating);

  private readonly seed = new Seed();

  private readonly discographySets = [this.seed.classicBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly similarBandsSets = [this.seed.popularBandsThisYear, this.seed.popularBandsAllTime];

  readonly discographyAlbums = computed(() => this.discographySets[this.discographyTabIndex()].slice(0, 4));
  readonly similarBands = computed(() => this.similarBandsSets[Math.min(this.similarBandsTabIndex(), 1)].slice(0, 3));

  readonly videos = this.seed.videoClips.slice(0, 3);
}
