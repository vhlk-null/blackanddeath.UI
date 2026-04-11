import { Component, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Band } from '../../../shared/models/band';

@Component({
  selector: 'app-band-card',
  imports: [RouterLink],
  templateUrl: './band-card.html',
  styleUrl: './band-card.scss',
})
export class BandCard {
  bandCard = input.required<Band>();
  readonly imageError = signal(false);
}
