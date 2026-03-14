import { Component, input } from '@angular/core';
import { Album } from '../../models/album';

@Component({
  selector: 'app-album-card',
  imports: [],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
})
export class AlbumCard {
  albumCard = input.required<Album>();
}
