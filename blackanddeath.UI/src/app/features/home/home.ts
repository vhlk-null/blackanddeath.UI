import { Component } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard, BandCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {

  topRatedAlbums: Album[] = [
    { title: 'De Mysteriis Dom Sathanas', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '', id: 1 },
    { title: 'Altars of Madness', type: 'Full-Length', year: 1989, country: 'USA', genre: 'Death Metal', coverImage: '', id: 2 },
    { title: 'Transilvanian Hunger', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '', id: 3 },
    { title: 'Tomb of the Mutilated', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: '', id: 4 }
  ];

  popularBands: Band[] = [
    { name: 'Mayhem', country: 'Norway', genre: 'Black Metal', formedYear: 1984, coverImage: '', id: 1 },
    { name: 'Morbid Angel', country: 'USA', genre: 'Death Metal', formedYear: 1983, coverImage: '', id: 2 },
    { name: 'Darkthrone', country: 'Norway', genre: 'Black Metal', formedYear: 1986, coverImage: '', id: 3 },
  ];

  recentAlbums: Album[] = [
    { title: 'Progenitors of a New Breed', type: 'Full-Length', year: 2024, country: 'Finland', genre: 'Black Death Metal', coverImage: '', id: 5 },
    { title: 'Ritual of the Abyss', type: 'EP', year: 2024, country: 'Sweden', genre: 'Death Metal', coverImage: '', id: 6 },
    { title: 'Void Ascendancy', type: 'Full-Length', year: 2024, country: 'Germany', genre: 'Black Metal', coverImage: '', id: 7 },
    { title: 'Necromantic Hymns', type: 'Full-Length', year: 2023, country: 'Canada', genre: 'Black Death Metal', coverImage: '', id: 8 },
  ];
}
