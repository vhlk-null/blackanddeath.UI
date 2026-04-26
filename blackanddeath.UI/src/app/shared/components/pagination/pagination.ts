import { Component, computed, input, output, signal, ElementRef, AfterViewInit, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
})
export class Pagination implements AfterViewInit, OnDestroy {
  readonly total = input.required<number>();
  readonly pageSize = input<number>(20);
  readonly currentPage = input<number>(1);
  readonly loadedPage = input<number>(1);
  readonly pageChange = output<number>();
  readonly loadMore = output<void>();

  readonly isFixed = signal(true);

  @ViewChild('sentinel') sentinelRef!: ElementRef;

  private observer?: IntersectionObserver;

  readonly totalPages = computed(() => Math.ceil(this.total() / this.pageSize()));
  readonly hasMore = computed(() => this.loadedPage() < this.totalPages());

  readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | '...')[] = [1];

    if (current > 3) pages.push('...');

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  });

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => this.isFixed.set(!entry.isIntersecting),
      { threshold: 0.5 }
    );
    this.observer.observe(this.sentinelRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  goTo(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;
    this.pageChange.emit(page);
  }
}
