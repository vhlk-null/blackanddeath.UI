import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  readonly count = input<number>(8);
  readonly rating = input<number>(0);
  readonly ratingChange = output<number>();

  readonly hoverRating = signal(0);

  get stars(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i + 1);
  }

  isFilled(star: number): boolean {
    return star <= (this.hoverRating() || this.rating());
  }

  onHover(star: number): void {
    this.hoverRating.set(star);
  }

  onLeave(): void {
    this.hoverRating.set(0);
  }

  onSelect(star: number): void {
    this.ratingChange.emit(star);
  }
}
