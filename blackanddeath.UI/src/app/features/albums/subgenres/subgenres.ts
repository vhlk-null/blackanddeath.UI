import { Component, signal, computed } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { Seed } from '../../../shared/constants/seed.data';
import { SUBGENRE_TABS, CLASSIC_BLACK_DEATH_TITLE, WAR_METAL_TITLE, CAVERNOUS_BLACK_DEATH_TITLE, BLACKENED_DEATH_TITLE } from '../../../shared/constants/constants';
import { AlbumCard } from '../card/album-card';

@Component({
  selector: 'app-subgenres',
  imports: [Section, AlbumCard],
  templateUrl: './subgenres.html',
  styleUrl: './subgenres.scss',
})
export class Subgenres {

  readonly tabs = {
    subgenre: SUBGENRE_TABS,
  };

  readonly titles = {
    classicDeath: CLASSIC_BLACK_DEATH_TITLE,
    warMetal: WAR_METAL_TITLE,
    cavernousBlackDeath: CAVERNOUS_BLACK_DEATH_TITLE,
    blackenedDeath: BLACKENED_DEATH_TITLE,
  };

  readonly tabIndex = signal(0);

  readonly classicDeathTabIndex = signal(0);
  readonly warMetalTabIndex = signal(0);
  readonly cavernousBlackDeathTabIndex = signal(0);
  readonly blackenedDeathTabIndex = signal(0);

  private readonly seed = new Seed();

  private readonly classicDeathSets = [this.seed.classicBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly warMetalSets = [this.seed.warMetal, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly cavernousSets = [this.seed.cavernousBlackDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];
  private readonly blackenedDeathSets = [this.seed.blackenedDeath, this.seed.topRatedThisMonth, this.seed.topRatedAllTime];

  readonly classicDeathAlbums = computed(() => this.classicDeathSets[this.classicDeathTabIndex()].slice(0, 4));
  readonly warMetalAlbums = computed(() => this.warMetalSets[this.warMetalTabIndex()].slice(0, 4));
  readonly cavernousBlackDeathAlbums = computed(() => this.cavernousSets[this.cavernousBlackDeathTabIndex()].slice(0, 4));
  readonly blackenedDeathAlbums = computed(() => this.blackenedDeathSets[this.blackenedDeathTabIndex()].slice(0, 4));
}
