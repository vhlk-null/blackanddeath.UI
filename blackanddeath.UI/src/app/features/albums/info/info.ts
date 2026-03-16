import { Component, computed, signal } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../card/album-card';
import { BandCard } from '../../bands/band-card/band-card';
import { Seed } from '../../../shared/constants/seed.data';
import { Track } from '../../../shared/models/track';
import {
  ALBUM_INFORMATION,
  DISCOGRAPHY_TITLE,
  VIDEOS_TITLE,
  SIMILAR_ALBUMS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-info',
  imports: [Section, AlbumCard, BandCard],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info {

  readonly tabs = {
    info: ALBUM_INFORMATION,
  };

  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    videos: VIDEOS_TITLE,
    similarAlbums: SIMILAR_ALBUMS_TITLE,
  };

  readonly infoTabIndex = signal(0);
  readonly tracklistTabIndex = signal(0);
  readonly discographyTabIndex = signal(0);
  readonly similarAlbumsTabIndex = signal(0);

  readonly tracklistTabs = ['Tracklist', 'Spotify', 'Amazon'];

  readonly album = {
    title: 'Desolate Divine',
    band: 'Proscription',
    coverImage: 'https://f4.bcbits.com/img/a0522392822_10.jpg',
    year: 2025,
    country: 'Finland',
    genre: 'Black Death Metal',
    type: 'Full-Length',
    label: 'Dark Descent Records',
    rating: 8,
    maxRating: 9,
  };

  readonly stars = Array.from({ length: this.album.maxRating }, (_, i) => i < this.album.rating);

  readonly tracks: Track[] = [
    { number: 1, title: 'Gleam of the Morningstar', duration: '3:30' },
    { number: 2, title: 'Veil of Pestilential Black', duration: '4:12' },
    { number: 3, title: 'Antithesis of Light', duration: '5:01' },
    { number: 4, title: 'Ritual of the Abyss', duration: '3:47' },
    { number: 5, title: 'Rites of the Ascension', duration: '6:22' },
    { number: 6, title: 'Profane Invocation', duration: '4:55' },
    { number: 7, title: 'Desolate Divine', duration: '7:14' },
    { number: 8, title: 'Necromantic Hymns', duration: '5:38' },
    { number: 9, title: 'The Underworld Ascension', duration: '10:30' },
  ];

  readonly totalDuration = '51:09';

  private readonly seed = new Seed();

  private readonly discographySets = [this.seed.topRatedThisYear, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly similarAlbumsSets = [this.seed.classicBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];

  readonly discographyAlbums = computed(() => this.discographySets[this.discographyTabIndex()].slice(0, 4));
  readonly similarAlbums = computed(() => this.similarAlbumsSets[this.similarAlbumsTabIndex()].slice(0, 4));

  readonly videos = this.seed.videoClips.slice(0, 3);
}
