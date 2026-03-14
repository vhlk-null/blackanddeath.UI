import { Component, input } from '@angular/core';
import { Band } from '../../../shared/models/band';

@Component({
  selector: 'app-band-card',
  imports: [],
  templateUrl: './band-card.html',
  styleUrl: './band-card.scss',
})
export class BandCard {
  bandCard = input.required<Band>();
}
