import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating {
  readonly count = input<number>(10);
  readonly rating = input<number>(0);
  readonly averageRating = input<number | null | undefined>(null);
  readonly ratingsCount = input<number | undefined>(undefined);
  readonly readonly = input<boolean>(false);
  readonly ratingChange = output<number>();

  readonly hoverRating = signal(0);

  get stars(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i + 1);
  }

  isFilled(star: number): boolean {
    return star <= (this.hoverRating() || this.rating());
  }

  onHover(star: number): void {
    if (!this.readonly()) this.hoverRating.set(star);
  }

  onLeave(): void {
    this.hoverRating.set(0);
  }

  onSelect(star: number): void {
    if (!this.readonly()) this.ratingChange.emit(star);
  }

  get displayAvg(): string {
    const avg = this.averageRating();
    if (avg == null) return '';
    return avg.toFixed(1);
  }
}
