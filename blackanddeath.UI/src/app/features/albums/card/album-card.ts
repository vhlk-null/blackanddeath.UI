import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Album } from '../../../shared/models/album';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
})
export class AlbumCard {
  albumCard = input.required<Album>();
}
