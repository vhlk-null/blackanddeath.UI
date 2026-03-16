import { Component, signal, computed } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { Seed } from '../../../shared/constants/seed.data';
import { SUBGENRE_TABS, CLASSIC_BLACK_DEATH_TITLE, WAR_METAL_TITLE, CAVERNOUS_BLACK_DEATH_TITLE, BLACKENED_DEATH_TITLE } from '../../../shared/constants/constants';
import { BandCard } from '../band-card/band-card';

@Component({
  selector: 'app-band-subgenres',
  imports: [Section, BandCard],
  templateUrl: './subgenres.html',
  styleUrl: './subgenres.scss',
})
export class BandSubgenres {

  readonly tabs = {
    subgenre: SUBGENRE_TABS,
  };

  readonly titles = {
    classicDeath: CLASSIC_BLACK_DEATH_TITLE,
    warMetal: WAR_METAL_TITLE,
    cavernousBlackDeath: CAVERNOUS_BLACK_DEATH_TITLE,
    blackenedDeath: BLACKENED_DEATH_TITLE,
  };

  readonly classicDeathTabIndex = signal(0);
  readonly warMetalTabIndex = signal(0);
  readonly cavernousBlackDeathTabIndex = signal(0);
  readonly blackenedDeathTabIndex = signal(0);

  private readonly seed = new Seed();

  readonly classicDeathBands = computed(() => this.seed.classicBlackDeathBands);
  readonly warMetalBands = computed(() => this.seed.warMetalBands);
  readonly cavernousBlackDeathBands = computed(() => this.seed.cavernousBlackDeathBands);
  readonly blackenedDeathBands = computed(() => this.seed.blackenedDeathBands);
}
