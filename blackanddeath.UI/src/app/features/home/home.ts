import { Component } from '@angular/core';
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

  private mainAlbumList: Album[] = [];
  private mainBandList: Band[] = [];

  // Top Rated
  topRatedThisYear: Album[] = [
    { id: 1, title: 'De Mysteriis Dom Sathanas', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { id: 2, title: 'Altars of Madness', type: 'Full-Length', year: 1989, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { id: 3, title: 'Transilvanian Hunger', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { id: 4, title: 'Tomb of the Mutilated', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: '' },
  ];
  topRatedThisMonth: Album[] = [
    { id: 5, title: 'Blessed Are the Sick', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { id: 6, title: 'Covenant', type: 'Full-Length', year: 1993, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { id: 7, title: 'The IVth Crusade', type: 'Full-Length', year: 1992, country: 'UK', genre: 'Death Metal', coverImage: '' },
    { id: 8, title: 'Emperor', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
  ];
  topRatedAllTime: Album[] = [
    { id: 9, title: 'Hvis Lyset Tar Oss', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { id: 10, title: 'Onward to Golgotha', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { id: 11, title: 'Dawn of Possession', type: 'Full-Length', year: 1991, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { id: 12, title: 'Under the Sign of the Black Mark', type: 'Full-Length', year: 1987, country: 'Sweden', genre: 'Black Metal', coverImage: '' },
  ];

  // Popular Bands
  popularBandsThisYear: Band[] = [
    { id: 1, name: 'Mayhem', country: 'Norway', genre: 'Black Metal', formedYear: 1984, coverImage: '' },
    { id: 2, name: 'Morbid Angel', country: 'USA', genre: 'Death Metal', formedYear: 1983, coverImage: '' },
    { id: 3, name: 'Darkthrone', country: 'Norway', genre: 'Black Metal', formedYear: 1986, coverImage: '' },
  ];
  popularBandsAllTime: Band[] = [
    { id: 4, name: 'Bathory', country: 'Sweden', genre: 'Black Metal', formedYear: 1983, coverImage: '' },
    { id: 5, name: 'Deicide', country: 'USA', genre: 'Death Metal', formedYear: 1987, coverImage: '' },
    { id: 6, name: 'Immortal', country: 'Norway', genre: 'Black Metal', formedYear: 1990, coverImage: '' },
  ];

  // Recently Added
  recentAlbums: Album[] = [
    { id: 13, title: 'Progenitors of a New Breed', type: 'Full-Length', year: 2024, country: 'Finland', genre: 'Black Death Metal', coverImage: '' },
    { id: 14, title: 'Ritual of the Abyss', type: 'EP', year: 2024, country: 'Sweden', genre: 'Death Metal', coverImage: '' },
    { id: 15, title: 'Void Ascendancy', type: 'Full-Length', year: 2024, country: 'Germany', genre: 'Black Metal', coverImage: '' },
    { id: 16, title: 'Necromantic Hymns', type: 'Full-Length', year: 2023, country: 'Canada', genre: 'Black Death Metal', coverImage: '' },
  ];
  recentBands: Band[] = [
    { id: 7, name: 'Valdur', country: 'USA', genre: 'Black Death Metal', formedYear: 2005, coverImage: '' },
    { id: 8, name: 'Hetroertzen', country: 'Chile', genre: 'Black Metal', formedYear: 2002, coverImage: '' },
    { id: 9, name: 'Antaeus', country: 'France', genre: 'Black Metal', formedYear: 1994, coverImage: '' },
  ];

  // Metal Videos
  videoClips: Band[] = [
    { id: 10, name: 'Watain', country: 'Sweden', genre: 'Black Metal', formedYear: 1998, coverImage: '' },
    { id: 11, name: 'Behemoth', country: 'Poland', genre: 'Black Death Metal', formedYear: 1991, coverImage: '' },
    { id: 12, name: 'Mgła', country: 'Poland', genre: 'Black Metal', formedYear: 2000, coverImage: '' },
  ];
  videoLive: Band[] = [
    { id: 13, name: 'Gorgoroth', country: 'Norway', genre: 'Black Metal', formedYear: 1992, coverImage: '' },
    { id: 14, name: 'Cannibal Corpse', country: 'USA', genre: 'Death Metal', formedYear: 1988, coverImage: '' },
    { id: 15, name: 'Nile', country: 'USA', genre: 'Death Metal', formedYear: 1993, coverImage: '' },
  ];
  videoPlaythroughs: Band[] = [
    { id: 16, name: 'Necrophagist', country: 'Germany', genre: 'Technical Death Metal', formedYear: 1992, coverImage: '' },
    { id: 17, name: 'Defeated Sanity', country: 'Germany', genre: 'Death Metal', formedYear: 1994, coverImage: '' },
    { id: 18, name: 'Hate Eternal', country: 'USA', genre: 'Death Metal', formedYear: 1997, coverImage: '' },
  ];

  // Upcoming Releases
  upcomingFullLength: Album[] = [
    { id: 17, title: 'Throne of Chaos', type: 'Full-Length', year: 2025, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { id: 18, title: 'Rites of Oblivion', type: 'Full-Length', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { id: 19, title: 'Abyss Eternal', type: 'Full-Length', year: 2025, country: 'Finland', genre: 'Black Death Metal', coverImage: '' },
    { id: 20, title: 'Pestilence Reborn', type: 'Full-Length', year: 2025, country: 'Sweden', genre: 'Death Metal', coverImage: '' },
  ];
  upcomingEP: Album[] = [
    { id: 21, title: 'Veil of Darkness', type: 'EP', year: 2025, country: 'Germany', genre: 'Black Metal', coverImage: '' },
    { id: 22, title: 'Necrotic Hymns', type: 'EP', year: 2025, country: 'UK', genre: 'Death Metal', coverImage: '' },
    { id: 23, title: 'Hellfire Doctrine', type: 'EP', year: 2025, country: 'USA', genre: 'Black Death Metal', coverImage: '' },
    { id: 24, title: 'Serpent Ritual', type: 'EP', year: 2025, country: 'Poland', genre: 'Black Metal', coverImage: '' },
  ];
  upcomingOther: Album[] = [
    { id: 25, title: 'Chaos Invocation', type: 'Single', year: 2025, country: 'Chile', genre: 'Black Metal', coverImage: '' },
    { id: 26, title: 'Demonized', type: 'Demo', year: 2025, country: 'Norway', genre: 'Death Metal', coverImage: '' },
    { id: 27, title: 'Wrath Descending', type: 'Split', year: 2025, country: 'France', genre: 'Black Metal', coverImage: '' },
    { id: 28, title: 'Iron Plague', type: 'Compilation', year: 2025, country: 'USA', genre: 'Death Metal', coverImage: '' },
  ];



  onTopRatedTabChange(index: number) {
    console.log('Top Rated Tab Changed:', index);
  }

  onPopularBandsTabChange(index: number) {
    console.log('Popular Bands Tab Changed:', index);
  }

  onRecentlyAddedTabChange(index: number) {
    console.log('Recently Added Tab Changed:', index);
  }

  onMetalVideosTabChange(index: number) {
    console.log('Metal Videos Tab Changed:', index);
  }

  onUpcomingReleasesTabChange(index: number) {
    console.log('Upcoming Releases Tab Changed:', index);
  }
}
