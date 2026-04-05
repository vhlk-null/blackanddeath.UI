import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoBandService } from '../../services/video-band.service';
import { VideoBand } from '../../../shared/models/video-band';
import { VideoCard } from '../../home/video-card/video-card';
import { Pagination } from '../../../shared/components/pagination/pagination';

const SORT_OPTIONS = ['Newest', 'Oldest', 'Name'] as const;
type SortOption = typeof SORT_OPTIONS[number];
const PAGE_SIZE = 9;

@Component({
  selector: 'app-all-videos',
  templateUrl: './all-videos.html',
  styleUrl: './all-videos.scss',
  imports: [VideoCard, Pagination],
})
export class AllVideos implements OnInit {
  private videoBandService = inject(VideoBandService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly sortOptions = SORT_OPTIONS;
  readonly pageSize = PAGE_SIZE;

  readonly videos = signal<VideoBand[]>([]);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly activeSort = signal<SortOption>('Newest');
  readonly activeVideoType = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const sort = params['sort'] as SortOption;
      this.activeSort.set(SORT_OPTIONS.includes(sort) ? sort : 'Newest');
      this.currentPage.set(Number(params['page']) || 1);
      this.activeVideoType.set(params['videoType'] ?? null);
      this.load();
    });
  }

  onSortChange(sort: string): void {
    this.activeSort.set(sort as SortOption);
    this.currentPage.set(1);
    this.updateUrl();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrl();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: this.activeSort(),
        page: this.currentPage(),
        videoType: this.activeVideoType() ?? undefined,
      },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    this.videoBandService.getAllPaginated({
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort(),
      videoType: this.activeVideoType() ?? undefined,
    }).subscribe({
      next: (result) => {
        this.videos.set(result.data);
        this.total.set(result.count);
      },
    });
  }
}
