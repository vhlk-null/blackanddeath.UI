import { Component, signal, computed } from '@angular/core';
import { Seed } from '../../shared/constants/seed.data';
import {
  ALBUMS_BANDS,
  SUBGENRE_TABS,
  CLASSIC_BLACK_DEATH_TITLE,
  WAR_METAL_TITLE,
  CAVERNOUS_BLACK_DEATH_TITLE,
  BLACKENED_DEATH_TITLE,
} from '../home/home.constants';
import { Section } from '../../shared/components/section/section';
import { AlbumCard } from '../albums/card/album-card';

@Component({
  selector: 'app-album-subgenres',
  imports: [Section, AlbumCard],
  templateUrl: './album-subgenres.html',
  styleUrl: './album-subgenres.scss',
})
export class AlbumSubgenres {

  readonly tabs = {
    albumBand: ALBUMS_BANDS,
    subgenre: SUBGENRE_TABS,
  };

  readonly titles = {
    classicDeath: CLASSIC_BLACK_DEATH_TITLE,
    warMetal: WAR_METAL_TITLE,
    cavernousBlackDeath: CAVERNOUS_BLACK_DEATH_TITLE,
    blackenedDeath: BLACKENED_DEATH_TITLE,
  };

  readonly tabIndex = signal(0);
  readonly pageTitle = computed(() => ALBUMS_BANDS[this.tabIndex()]);

  readonly classicDeathTabIndex = signal(0);
  readonly warMetalTabIndex = signal(0);
  readonly cavernousBlackDeathTabIndex = signal(0);
  readonly blackenedDeathTabIndex = signal(0);

  private readonly seed = new Seed();

  private readonly classicDeathSets = [this.seed.classicBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly warMetalSets = [this.seed.warMetal, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly cavernousSets = [this.seed.cavernousBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly blackenedDeathSets = [this.seed.blackenedDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];

  readonly classicDeathAlbums = computed(() => this.classicDeathSets[this.classicDeathTabIndex()]);
  readonly warMetalAlbums = computed(() => this.warMetalSets[this.warMetalTabIndex()]);
  readonly cavernousBlackDeathAlbums = computed(() => this.cavernousSets[this.cavernousBlackDeathTabIndex()]);
  readonly blackenedDeathAlbums = computed(() => this.blackenedDeathSets[this.blackenedDeathTabIndex()]);
}
