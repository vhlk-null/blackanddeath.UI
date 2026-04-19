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
  canScrollLeft = signal(false);
  canScrollRight = signal(false);

  private _loadMoreLocked = false;
  private _scrollEndTimer: ReturnType<typeof setTimeout> | null = null;
  private _leaveTimer: ReturnType<typeof setTimeout> | null = null;

  onMouseEnter(): void {
    if (this._leaveTimer) { clearTimeout(this._leaveTimer); this._leaveTimer = null; }
    this.hovered.set(true);
  }

  onMouseLeave(): void {
    this._leaveTimer = setTimeout(() => this.hovered.set(false), 150);
  }

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
    this.updateScrollState(el);
    if (this._loadMoreLocked) return;
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 8) {
      this._loadMoreLocked = true;
      this.loadMore.emit();
    }
  }

  private updateScrollState(el: HTMLElement): void {
    this.canScrollLeft.set(el.scrollLeft > 1);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
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
    this.activeDot.set(Math.round(el.scrollLeft / scrollStep));
  }

  ngAfterViewInit(): void {
    const el = this.contentEl()?.nativeElement;
    if (!el) return;
    this.updateDots(el);
    this.updateScrollState(el);
    const ro = new ResizeObserver(() => { this.updateDots(el); this.updateScrollState(el); });
    ro.observe(el);
  }

  unlockLoadMore(): void {
    this._loadMoreLocked = false;
  }

}
