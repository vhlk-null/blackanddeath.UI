import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumService } from '../../services/album.servics';
import { Album } from '../../../shared/models/album';
import { AlbumCard } from '../card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Section } from '../../../shared/components/section/section';

const TABS = ['Latest', 'This Year', 'Popular'];
const PAGE_SIZE = 20;


@Component({
  selector: 'app-all-albums',
  templateUrl: './all-albums.html',
  styleUrl: './all-albums.scss',
  imports: [AlbumCard, Pagination, Section],
})
export class AllAlbums implements OnInit {
  private albumService = inject(AlbumService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly tabs = TABS;
  readonly pageSize = PAGE_SIZE;

  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly activeTab = signal(0);

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.activeTab.set(Number(params['tab']) || 0);
    this.currentPage.set(Number(params['page']) || 1);
    this.load();
  }

  onTabChange(index: number): void {
    this.activeTab.set(index);
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
      queryParams: { tab: this.activeTab(), page: this.currentPage() },
      queryParamsHandling: 'merge',
    });
  }

  private load(): void {
    this.albumService.getAllPaginated({
      page: this.currentPage(),
      pageSize: this.pageSize,
    }).subscribe({
      next: (result) => {
        this.albums.set(result.data);
        this.total.set(result.count);
      },
    });
  }
}
