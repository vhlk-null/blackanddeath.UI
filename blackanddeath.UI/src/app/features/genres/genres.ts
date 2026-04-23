import { Component, inject, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Section } from '../../shared/components/section/section';
import { GenreCard, Genre } from './genre-card/genre-card';
import { GenreService } from '../services/genre.service';

@Component({
  selector: 'app-genres',
  imports: [Section, GenreCard],
  templateUrl: './genres.html',
  styleUrl: './genres.scss',
})
export class Genres implements OnInit {
  private genreService = inject(GenreService);
  private titleService = inject(Title);

  readonly title = 'Genres To Explore';
  readonly genres = signal<Genre[]>([]);

  ngOnInit(): void {
    this.titleService.setTitle('Genres — Black And Death');
    this.genreService.getCards().subscribe({
      next: (genres) => this.genres.set(genres),
      error: () => {},
    });
  }
}
