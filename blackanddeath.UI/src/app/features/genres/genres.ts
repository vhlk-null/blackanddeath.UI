import { Component } from '@angular/core';
import { Section } from '../../shared/components/section/section';
import { GenreCard, Genre } from './genre-card/genre-card';

@Component({
  selector: 'app-genres',
  imports: [Section, GenreCard],
  templateUrl: './genres.html',
  styleUrl: './genres.scss',
})
export class Genres {
  readonly title = 'Genres To Explore';

  readonly genres: Genre[] = [
    { id: 1, name: 'Classic', slug: 'classic' },
    { id: 2, name: 'War Metal', slug: 'war-metal' },
    { id: 3, name: 'Cavernous', slug: 'cavernous' },
    { id: 4, name: 'Blackened Death', slug: 'blackened-death' },
    { id: 5, name: 'Melodic', slug: 'melodic' },
    { id: 6, name: 'Symphonic', slug: 'symphonic' },
    { id: 7, name: 'Doom', slug: 'doom' },
    { id: 8, name: 'Thrash', slug: 'thrash' },
    { id: 9, name: 'Dissonant', slug: 'dissonant' },
    { id: 10, name: 'Progressive', slug: 'progressive' },
    { id: 11, name: 'Technical', slug: 'technical' },
    { id: 12, name: 'Avant-Garde', slug: 'avant-garde' },
    { id: 13, name: 'Grind', slug: 'grind' },
    { id: 14, name: 'Brutal', slug: 'brutal' },
    { id: 15, name: 'Sludge/Crust', slug: 'sludge-crust' },
    { id: 16, name: 'Folk/Oriental', slug: 'folk-oriental' },
  ];
}
