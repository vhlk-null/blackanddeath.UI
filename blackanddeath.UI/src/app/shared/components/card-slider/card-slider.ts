import { Component, input, viewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-card-slider',
  templateUrl: './card-slider.html',
  styleUrl: './card-slider.scss',
  host: { '[style.--items-visible]': 'itemsVisible()' },
})
export class CardSlider {
  itemsVisible = input<number>(4);
  private track = viewChild<ElementRef<HTMLElement>>('track');

  scroll(direction: 'prev' | 'next'): void {
    const el = this.track()?.nativeElement;
    if (!el) return;
    const item = el.firstElementChild as HTMLElement;
    const itemWidth = item ? item.clientWidth + 10 : 300;
    el.scrollBy({ left: direction === 'next' ? itemWidth : -itemWidth, behavior: 'smooth' });
  }
}
