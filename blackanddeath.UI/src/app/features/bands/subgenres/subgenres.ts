import { Component, signal, OnInit, inject } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { SUBGENRE_TABS, CLASSIC_BLACK_DEATH_TITLE, WAR_METAL_TITLE, CAVERNOUS_BLACK_DEATH_TITLE, BLACKENED_DEATH_TITLE } from '../../../shared/constants/constants';
import { BandCard } from '../band-card/band-card';
import { BandService } from '../../services/band.service';
import { Band } from '../../../shared/models/band';

@Component({
  selector: 'app-band-subgenres',
  imports: [Section, BandCard],
  templateUrl: './subgenres.html',
  styleUrl: './subgenres.scss',
})
export class BandSubgenres implements OnInit {

  private bandService = inject(BandService);

  readonly tabs = { subgenre: SUBGENRE_TABS };

  readonly titles = {
    classicDeath: CLASSIC_BLACK_DEATH_TITLE,
    warMetal: WAR_METAL_TITLE,
    cavernousBlackDeath: CAVERNOUS_BLACK_DEATH_TITLE,
    blackenedDeath: BLACKENED_DEATH_TITLE,
  };

  readonly classicDeathBands = signal<Band[]>([]);
  readonly warMetalBands = signal<Band[]>([]);
  readonly cavernousBlackDeathBands = signal<Band[]>([]);
  readonly blackenedDeathBands = signal<Band[]>([]);

  private allBands: Band[] = [];

  private slice(section: number, tab: number): Band[] {
    const start = (section * 2 + tab) * 3;
    return this.allBands.slice(start, start + 3);
  }

  ngOnInit(): void {
    this.bandService.getAll().subscribe({
      next: (bands) => {
        this.allBands = bands;
        this.classicDeathBands.set(this.slice(0, 0));
        this.warMetalBands.set(this.slice(1, 0));
        this.cavernousBlackDeathBands.set(this.slice(2, 0));
        this.blackenedDeathBands.set(this.slice(3, 0));
      }
    });
  }

  onClassicDeathTabChange(i: number): void { this.classicDeathBands.set(this.slice(0, i)); }
  onWarMetalTabChange(i: number): void { this.warMetalBands.set(this.slice(1, i)); }
  onCavernousTabChange(i: number): void { this.cavernousBlackDeathBands.set(this.slice(2, i)); }
  onBlackenedDeathTabChange(i: number): void { this.blackenedDeathBands.set(this.slice(3, i)); }
}
