import { Component, OnInit, inject, signal } from '@angular/core';
import { Section } from '../../../shared/components/section/section';
import { SUBGENRE_TABS, CLASSIC_BLACK_DEATH_TITLE, WAR_METAL_TITLE, CAVERNOUS_BLACK_DEATH_TITLE, BLACKENED_DEATH_TITLE } from '../../../shared/constants/constants';
import { AlbumCard } from '../card/album-card';
import { AlbumService } from '../../services/album.servics';
import { Album } from '../../../shared/models/album';

@Component({
  selector: 'app-subgenres',
  imports: [Section, AlbumCard],
  templateUrl: './subgenres.html',
  styleUrl: './subgenres.scss',
})
export class Subgenres implements OnInit {

  private albumService = inject(AlbumService);

  readonly tabs = { subgenre: SUBGENRE_TABS };

  readonly titles = {
    classicDeath: CLASSIC_BLACK_DEATH_TITLE,
    warMetal: WAR_METAL_TITLE,
    cavernousBlackDeath: CAVERNOUS_BLACK_DEATH_TITLE,
    blackenedDeath: BLACKENED_DEATH_TITLE,
  };

  readonly classicDeathAlbums = signal<Album[]>([]);
  readonly warMetalAlbums = signal<Album[]>([]);
  readonly cavernousBlackDeathAlbums = signal<Album[]>([]);
  readonly blackenedDeathAlbums = signal<Album[]>([]);

  private allAlbums: Album[] = [];

  private slice(section: number, tab: number): Album[] {
    const start = (section * 3 + tab) * 4;
    return this.allAlbums.slice(start, start + 4);
  }

  ngOnInit(): void {
    this.albumService.getAll().subscribe({
      next: (albums) => {
        this.allAlbums = albums;
        this.classicDeathAlbums.set(this.slice(0, 0));
        this.warMetalAlbums.set(this.slice(1, 0));
        this.cavernousBlackDeathAlbums.set(this.slice(2, 0));
        this.blackenedDeathAlbums.set(this.slice(3, 0));
      }
    });
  }

  onClassicDeathTabChange(i: number): void { this.classicDeathAlbums.set(this.slice(0, i)); }
  onWarMetalTabChange(i: number): void { this.warMetalAlbums.set(this.slice(1, i)); }
  onCavernousTabChange(i: number): void { this.cavernousBlackDeathAlbums.set(this.slice(2, i)); }
  onBlackenedDeathTabChange(i: number): void { this.blackenedDeathAlbums.set(this.slice(3, i)); }
}
