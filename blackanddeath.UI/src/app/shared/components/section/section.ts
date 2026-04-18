import { Component, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { Tabs } from '../tabs/tabs';

@Component({
  selector: 'app-section',
  imports: [Tabs],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {
  sectionTitle = input<string>('');
  tabs = input<string[]>();
  initialTab = input<number>(0);
  columns = input<number>(4);
  mobileColumns = input<number>(2);
  arrows = input<boolean>(true);
  scroll = input<boolean>(true);
  tabChange = output<number>();
  loadMore = output<void>();

  hovered = signal(false);
  contentEl = viewChild<ElementRef<HTMLElement>>('contentEl');

  private _emittingLoadMore = false;

  scrollContent(direction: -1 | 1): void {
    const el = this.contentEl()?.nativeElement;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = firstChild.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.floor(el.clientWidth / cardWidth));
    el.scrollBy({ left: direction * cardWidth * visibleCards, behavior: 'smooth' });
  }

  onScroll(event: Event): void {
    if (this._emittingLoadMore) return;
    const el = event.target as HTMLElement;
    const firstChild = el.firstElementChild as HTMLElement | null;
    const cardWidth = firstChild ? firstChild.getBoundingClientRect().width : el.clientWidth;
    const threshold = cardWidth * 3;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold) {
      this._emittingLoadMore = true;
      this.loadMore.emit();
      setTimeout(() => { this._emittingLoadMore = false; }, 1500);
    }
  }

}
