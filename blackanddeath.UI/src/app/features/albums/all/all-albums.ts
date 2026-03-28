import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.servics';
import { Album } from '../../../shared/models/album';
import { AlbumCard } from '../card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';

const SORT_OPTIONS = ['Newest', 'Oldest', 'ReleaseDate', 'Title'] as const;
type SortOption = typeof SORT_OPTIONS[number];
const PAGE_SIZE = 20;


@Component({
  selector: 'app-all-albums',
  templateUrl: './all-albums.html',
  styleUrl: './all-albums.scss',
  imports: [AlbumCard, Pagination],
})
export class AllAlbums implements OnInit {
  private albumService = inject(AlbumService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly sortOptions = SORT_OPTIONS;
  readonly pageSize = PAGE_SIZE;

  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly activeSort = signal<SortOption>('Newest');

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const sort = params['sort'] as SortOption;
    this.activeSort.set(SORT_OPTIONS.includes(sort) ? sort : 'Newest');
    this.currentPage.set(Number(params['page']) || 1);
    this.load();
  }

  onSortChange(sort: string): void {
    this.activeSort.set(sort as SortOption);
    this.currentPage.set(1);
    this.updateUrl();
    this.load();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.updateUrl();
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { sort: this.activeSort(), page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    this.albumService.getAllPaginated({
      pageIndex: this.currentPage() - 1,
      pageSize: this.pageSize,
      sortBy: this.activeSort(),
    }).subscribe({
      next: (result) => {
        this.albums.set(result.data);
        this.total.set(result.count);
      },
    });
  }
}
