import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Genre {
  id: string;
  name: string;
}

@Component({
  selector: 'app-genre-card',
  imports: [RouterLink],
  templateUrl: './genre-card.html',
  styleUrl: './genre-card.scss',
})
export class GenreCard {
  genre = input.required<Genre>();
}
