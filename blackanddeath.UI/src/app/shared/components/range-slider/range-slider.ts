import { Component, ElementRef, input, output, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-range-slider',
  standalone: true,
  templateUrl: './range-slider.html',
  styleUrl: './range-slider.scss',
})
export class RangeSlider implements OnDestroy {
  readonly min = input<number>(0);
  readonly max = input<number>(100);

  readonly valueFrom = input<number | null>(null);
  readonly valueTo = input<number | null>(null);
  readonly valueFromChange = output<number>();
  readonly valueToChange = output<number>();
  readonly dragEnd = output<void>();

  @ViewChild('track') trackRef!: ElementRef<HTMLDivElement>;

  private dragging: 'from' | 'to' | null = null;
  private boundMove = this.onPointerMove.bind(this);
  private boundUp = this.onPointerUp.bind(this);

  get from(): number { return this.valueFrom() ?? this.min(); }
  get to(): number { return this.valueTo() ?? this.max(); }

  get fromPct(): number { return ((this.from - this.min()) / (this.max() - this.min())) * 100; }
  get toPct(): number { return ((this.to - this.min()) / (this.max() - this.min())) * 100; }

  onTrackPointerDown(e: PointerEvent): void {
    const pct = this.getPct(e);
    const val = Math.round(this.min() + pct * (this.max() - this.min()));
    const distFrom = Math.abs(val - this.from);
    const distTo = Math.abs(val - this.to);
    this.dragging = distFrom <= distTo ? 'from' : 'to';
    this.updateValue(e);
    window.addEventListener('pointermove', this.boundMove);
    window.addEventListener('pointerup', this.boundUp);
  }

  private onPointerMove(e: PointerEvent): void { this.updateValue(e); }

  private onPointerUp(): void {
    this.dragging = null;
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
    this.dragEnd.emit();
  }

  private updateValue(e: PointerEvent): void {
    if (!this.dragging) return;
    const pct = this.getPct(e);
    const val = Math.round(Math.max(this.min(), Math.min(this.max(), this.min() + pct * (this.max() - this.min()))));

    if (this.dragging === 'from') {
      if (val > this.to) {
        this.valueFromChange.emit(this.to);
        this.valueToChange.emit(val);
        this.dragging = 'to';
      } else {
        this.valueFromChange.emit(val);
      }
    } else {
      if (val < this.from) {
        this.valueToChange.emit(this.from);
        this.valueFromChange.emit(val);
        this.dragging = 'from';
      } else {
        this.valueToChange.emit(val);
      }
    }
  }

  private getPct(e: PointerEvent): number {
    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  }

  ngOnDestroy(): void {
    window.removeEventListener('pointermove', this.boundMove);
    window.removeEventListener('pointerup', this.boundUp);
  }
}
