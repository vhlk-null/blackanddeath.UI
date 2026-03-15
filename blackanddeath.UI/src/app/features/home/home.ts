import { Component, signal, computed } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';
import {
  TOP_RATED_TABS,
  POPULAR_BANDS_TABS,
  RECENTLY_ADDED_TABS,
  METAL_VIDEOS_TABS,
  UPCOMING_RELEASES_TABS,
} from './home.constants';

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

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

  //#region Data
  topRatedThisYear: Album[] = [
    { id: 1, title: 'De Mysteriis Dom Sathanas', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/dmds/300/300?grayscale' },
    { id: 2, title: 'Altars of Madness', type: 'Full-Length', year: 1989, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/altars/300/300?grayscale' },
    { id: 3, title: 'Transilvanian Hunger', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/transilvanian/300/300?grayscale' },
    { id: 4, title: 'Tomb of the Mutilated', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: '' },
  ];
  topRatedThisMonth: Album[] = [
    { id: 5, title: 'Blessed Are the Sick', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/blessed/300/300?grayscale' },
    { id: 6, title: 'Covenant', type: 'Full-Length', year: 1993, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/covenant/300/300?grayscale' },
    { id: 7, title: 'The IVth Crusade', type: 'Full-Length', year: 1992, country: 'UK', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/crusade/300/300?grayscale' },
    { id: 8, title: 'Emperor', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/emperor/300/300?grayscale' },
  ];
  topRatedAllTime: Album[] = [
    { id: 9, title: 'Hvis Lyset Tar Oss', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/hvislyset/300/300?grayscale' },
    { id: 10, title: 'Onward to Golgotha', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/golgotha/300/300?grayscale' },
    { id: 11, title: 'Dawn of Possession', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/dawnpossession/300/300?grayscale' },
    { id: 12, title: 'Under the Sign of the Black Mark', type: 'Full-Length', year: 1987, country: 'Sweden', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/blackmark/300/300?grayscale' },
  ];

  // Popular Bands
  popularBandsThisYear: Band[] = [
    { id: 1, name: 'Mayhem', country: 'Norway', genre: 'Black Metal', formedYear: 1984, coverImage: 'https://picsum.photos/seed/mayhem/300/300?grayscale' },
    { id: 2, name: 'Morbid Angel', country: 'USA', genre: 'Death Metal', formedYear: 1983, coverImage: 'https://picsum.photos/seed/morbidangel/300/300?grayscale' },
    { id: 3, name: 'Darkthrone', country: 'Norway', genre: 'Black Metal', formedYear: 1986, coverImage: 'https://picsum.photos/seed/darkthrone/300/300?grayscale' },
  ];
  popularBandsAllTime: Band[] = [
    { id: 4, name: 'Bathory', country: 'Sweden', genre: 'Black Metal', formedYear: 1983, coverImage: 'https://picsum.photos/seed/bathory/300/300?grayscale' },
    { id: 5, name: 'Deicide', country: 'USA', genre: 'Death Metal', formedYear: 1987, coverImage: 'https://picsum.photos/seed/deicide/300/300?grayscale' },
    { id: 6, name: 'Immortal', country: 'Norway', genre: 'Black Metal', formedYear: 1990, coverImage: 'https://picsum.photos/seed/immortal/300/300?grayscale' },
  ];

  // Recently Added
  recentAlbums: Album[] = [
    { id: 13, title: 'Progenitors of a New Breed', type: 'Full-Length', year: 2024, country: 'Finland', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/progenitors/300/300?grayscale' },
    { id: 14, title: 'Ritual of the Abyss', type: 'EP', year: 2024, country: 'Sweden', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ritualabyss/300/300?grayscale' },
    { id: 15, title: 'Void Ascendancy', type: 'Full-Length', year: 2024, country: 'Germany', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/voidasc/300/300?grayscale' },
    { id: 16, title: 'Necromantic Hymns', type: 'Full-Length', year: 2023, country: 'Canada', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/necrohymns/300/300?grayscale' },
  ];
  recentBands: Band[] = [
    { id: 7, name: 'Valdur', country: 'USA', genre: 'Black Death Metal', formedYear: 2005, coverImage: 'https://picsum.photos/seed/valdur/300/300?grayscale' },
    { id: 8, name: 'Hetroertzen', country: 'Chile', genre: 'Black Metal', formedYear: 2002, coverImage: 'https://picsum.photos/seed/hetroertzen/300/300?grayscale' },
    { id: 9, name: 'Antaeus', country: 'France', genre: 'Black Metal', formedYear: 1994, coverImage: 'https://picsum.photos/seed/antaeus/300/300?grayscale' },
  ];

  // Metal Videos
  videoClips: Band[] = [
    { id: 10, name: 'Watain', country: 'Sweden', genre: 'Black Metal', formedYear: 1998, coverImage: 'https://picsum.photos/seed/watain/300/300?grayscale' },
    { id: 11, name: 'Behemoth', country: 'Poland', genre: 'Black Death Metal', formedYear: 1991, coverImage: 'https://picsum.photos/seed/behemoth/300/300?grayscale' },
    { id: 12, name: 'Mgła', country: 'Poland', genre: 'Black Metal', formedYear: 2000, coverImage: 'https://picsum.photos/seed/mgla/300/300?grayscale' },
  ];
  videoLive: Band[] = [
    { id: 13, name: 'Gorgoroth', country: 'Norway', genre: 'Black Metal', formedYear: 1992, coverImage: 'https://picsum.photos/seed/gorgoroth/300/300?grayscale' },
    { id: 14, name: 'Cannibal Corpse', country: 'USA', genre: 'Death Metal', formedYear: 1988, coverImage: 'https://picsum.photos/seed/cannibalcorpse/300/300?grayscale' },
    { id: 15, name: 'Nile', country: 'USA', genre: 'Death Metal', formedYear: 1993, coverImage: 'https://picsum.photos/seed/nile/300/300?grayscale' },
  ];
  videoPlaythroughs: Band[] = [
    { id: 16, name: 'Necrophagist', country: 'Germany', genre: 'Technical Death Metal', formedYear: 1992, coverImage: 'https://picsum.photos/seed/necrophagist/300/300?grayscale' },
    { id: 17, name: 'Defeated Sanity', country: 'Germany', genre: 'Death Metal', formedYear: 1994, coverImage: 'https://picsum.photos/seed/defeatedsanity/300/300?grayscale' },
    { id: 18, name: 'Hate Eternal', country: 'USA', genre: 'Death Metal', formedYear: 1997, coverImage: 'https://picsum.photos/seed/hateeternal/300/300?grayscale' },
  ];

  // Upcoming Releases
  upcomingFullLength: Album[] = [
    { id: 17, title: 'Throne of Chaos', type: 'Full-Length', year: 2025, country: 'Norway', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/thronechaos/300/300?grayscale' },
    { id: 18, title: 'Rites of Oblivion', type: 'Full-Length', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ritesoblivion/300/300?grayscale' },
    { id: 19, title: 'Abyss Eternal', type: 'Full-Length', year: 2025, country: 'Finland', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/abysseternal/300/300?grayscale' },
    { id: 20, title: 'Pestilence Reborn', type: 'Full-Length', year: 2025, country: 'Sweden', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/pestilence/300/300?grayscale' },
  ];
  upcomingEP: Album[] = [
    { id: 21, title: 'Veil of Darkness', type: 'EP', year: 2025, country: 'Germany', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/veildark/300/300?grayscale' },
    { id: 22, title: 'Necrotic Hymns', type: 'EP', year: 2025, country: 'UK', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/necrotichymns/300/300?grayscale' },
    { id: 23, title: 'Hellfire Doctrine', type: 'EP', year: 2025, country: 'USA', genre: 'Black Death Metal', coverImage: 'https://picsum.photos/seed/hellfire/300/300?grayscale' },
    { id: 24, title: 'Serpent Ritual', type: 'EP', year: 2025, country: 'Poland', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/serpent/300/300?grayscale' },
  ];
  upcomingOther: Album[] = [
    { id: 25, title: 'Chaos Invocation', type: 'Single', year: 2025, country: 'Chile', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/chaosinvoc/300/300?grayscale' },
    { id: 26, title: 'Demonized', type: 'Demo', year: 2025, country: 'Norway', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/demonized/300/300?grayscale' },
    { id: 27, title: 'Wrath Descending', type: 'Split', year: 2025, country: 'France', genre: 'Black Metal', coverImage: 'https://picsum.photos/seed/wrath/300/300?grayscale' },
    { id: 28, title: 'Iron Plague', type: 'Compilation', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: 'https://picsum.photos/seed/ironplague/300/300?grayscale' },
  ];

  //#endregion

  readonly sectionData = {
    topRated: [this.topRatedThisYear, this.topRatedThisMonth, this.topRatedAllTime],
    popularBands: [this.popularBandsThisYear, this.popularBandsAllTime],
    recentlyAdded: [this.recentAlbums],
    metalVideos: [this.videoClips, this.videoLive, this.videoPlaythroughs],
    upcomingReleases: [this.upcomingFullLength, this.upcomingEP, this.upcomingOther],
  };

}
