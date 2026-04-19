import { AfterViewInit, Component, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { Tabs } from '../tabs/tabs';

@Component({
  selector: 'app-section',
  imports: [Tabs],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section implements AfterViewInit {
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
  dotCount = signal(0);
  activeDot = signal(0);
  dots = signal<null[]>([]);

  private _loadMoreLocked = false;
  private _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

  scrollContent(direction: -1 | 1): void {
    const el = this.contentEl()?.nativeElement;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = firstChild.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.round(el.clientWidth / cardWidth));
    el.scrollBy({ left: direction * cardWidth * visibleCards, behavior: 'smooth' });
    if (this._scrollEndTimer) clearTimeout(this._scrollEndTimer);
    this._scrollEndTimer = setTimeout(() => this.updateActiveDot(el, cardWidth, visibleCards), 350);
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (this._loadMoreLocked) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      this._loadMoreLocked = true;
      this.loadMore.emit();
    }
  }

  private getCardMetrics(el: HTMLElement): { cardWidth: number; visibleCards: number } | null {
    const firstChild = el.firstElementChild as HTMLElement | null;
    if (!firstChild) return null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const cardWidth = firstChild.getBoundingClientRect().width + gap;
    const visibleCards = Math.max(1, Math.round(el.clientWidth / cardWidth));
    return { cardWidth, visibleCards };
  }

  private updateDots(el: HTMLElement): void {
    const metrics = this.getCardMetrics(el);
    if (!metrics) { this.dotCount.set(0); this.dots.set([]); return; }
    const { visibleCards } = metrics;
    const totalCards = el.children.length;
    const pages = Math.ceil(totalCards / visibleCards);
    const count = pages > 1 ? pages : 0;
    this.dotCount.set(count);
    this.dots.set(Array(count).fill(null));
  }

  private updateActiveDot(el: HTMLElement, cardWidth: number, visibleCards: number): void {
    const scrollStep = cardWidth * visibleCards;
    this.activeDot.set(el.scrollLeft < 8 ? 0 : Math.ceil(el.scrollLeft / scrollStep));
  }

  ngAfterViewInit(): void {
    const el = this.contentEl()?.nativeElement;
    if (!el) return;
    this.updateDots(el);
    const ro = new ResizeObserver(() => this.updateDots(el));
    ro.observe(el);
  }

  unlockLoadMore(): void {
    this._loadMoreLocked = false;
  }

}
