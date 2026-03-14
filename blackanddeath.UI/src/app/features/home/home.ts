import { Component } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { AlbumCard } from '../../shared/components/cards/album-card';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';

@Component({
  selector: 'app-home',
  imports: [Section, AlbumCard],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  
  topRatedAlbums: Album[] = [
    { title: 'De Mysteriis Dom Sathanas', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { title: 'Altars of Madness', type: 'Full-Length', year: 1989, country: 'USA', genre: 'Death Metal', coverImage: '' },
    { title: 'Transilvanian Hunger', type: 'Full-Length', year: 1994, country: 'Norway', genre: 'Black Metal', coverImage: '' },
    { title: 'Tomb of the Mutilated', type: 'Full-Length', year: 1992, country: 'USA', genre: 'Death Metal', coverImage: '' }
  ];

  popularBands: Band[] = [
    { name: 'Mayhem', country: 'Norway', genre: 'Black Metal', formedYear: 1984, coverImage: '' },
    { name: 'Morbid Angel', country: 'USA', genre: 'Death Metal', formedYear: 1983, coverImage: '' },
    { name: 'Darkthrone', country: 'Norway', genre: 'Black Metal', formedYear: 1986, coverImage: '' },
  ];

  recentAlbums: Album[] = [
    { title: 'Progenitors of a New Breed', type: 'Full-Length', year: 2024, country: 'Finland', genre: 'Black Death Metal', coverImage: '' },
    { title: 'Ritual of the Abyss', type: 'EP', year: 2024, country: 'Sweden', genre: 'Death Metal', coverImage: '' },
    { title: 'Void Ascendancy', type: 'Full-Length', year: 2024, country: 'Germany', genre: 'Black Metal', coverImage: '' },
    { title: 'Necromantic Hymns', type: 'Full-Length', year: 2023, country: 'Canada', genre: 'Black Death Metal', coverImage: '' },
  ];
}
