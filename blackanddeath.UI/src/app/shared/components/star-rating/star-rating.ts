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
  readonly ratingChange = output<number>();

  readonly hoverRating = signal(0);

  get stars(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i + 1);
  }

  isFilled(star: number): boolean {
    return star <= (this.hoverRating() || this.rating());
  }

  // 'full' | 'half' | 'empty'
  getAvgFill(star: number): 'full' | 'half' | 'empty' {
    const avg = this.averageRating();
    if (avg == null) return 'empty';
    if (star <= Math.floor(avg)) return 'full';
    if (star === Math.ceil(avg) && avg % 1 >= 0.5) return 'half';
    return 'empty';
  }

  // offset для linearGradient — скільки зірки заповнено
  getHalfOffset(star: number): string {
    const avg = this.averageRating();
    if (avg == null) return '0%';
    if (star <= Math.floor(avg)) return '100%';
    if (star === Math.ceil(avg)) return `${Math.round((avg % 1) * 100)}%`;
    return '0%';
  }

  getFill(star: number): string {
    const hovered = this.hoverRating();
    const userRating = this.rating();

    if (hovered) return star <= hovered ? 'var(--color-star)' : 'none';
    if (userRating) return star <= userRating ? 'var(--color-star)' : 'none';

    const fill = this.getAvgFill(star);
    if (fill === 'full') return 'var(--color-star)';
    if (fill === 'half') return `url(#half-${star})`;
    return 'none';
  }

  getStroke(star: number): string {
    const hovered = this.hoverRating();
    const userRating = this.rating();

    if (hovered) return 'var(--color-star)';
    if (userRating) return 'var(--color-star)';

    const fill = this.getAvgFill(star);
    return fill !== 'empty' ? 'var(--color-star)' : 'var(--color-star-empty, var(--color-star))';
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

  get displayAvg(): string {
    const avg = this.averageRating();
    if (avg == null) return '';
    return avg.toFixed(1);
  }
}
