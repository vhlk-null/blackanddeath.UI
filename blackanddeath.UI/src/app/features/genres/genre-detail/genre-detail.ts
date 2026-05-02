import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GenreService } from '../../services/genre.service';
import { AlbumCard } from '../../albums/card/album-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Album } from '../../../shared/models/album';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-genre-detail',
  imports: [AlbumCard, Pagination],
  templateUrl: './genre-detail.html',
  styleUrl: './genre-detail.scss',
})
export class GenreDetail implements OnInit {
  private genreService = inject(GenreService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);

  readonly pageSize = PAGE_SIZE;
  readonly cardName = signal<string>('');
  readonly albums = signal<Album[]>([]);
  readonly total = signal(0);
  readonly currentPage = signal(1);
  readonly loadedPage = signal(1);

  private cardId = '';

  ngOnInit(): void {
    this.cardId = this.route.snapshot.paramMap.get('id')!;
    this.route.queryParams.subscribe(params => {
      const page = Number(params['page']) || 1;
      this.currentPage.set(page);
      this.loadedPage.set(page);
      this.loadPage(page, false);
    });

    this.genreService.getCardById(this.cardId).subscribe({
      next: (card) => { this.cardName.set(card.name); this.titleService.setTitle(`${card.name} — Black And Death`); },
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadedPage.set(page);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onLoadMore(): void {
    const next = this.loadedPage() + 1;
    this.loadedPage.set(next);
    this.loadPage(next, true);
  }

  private loadPage(page: number, append: boolean): void {
    this.genreService.getCardAlbums(this.cardId, {
      pageIndex: page - 1,
      pageSize: this.pageSize,
    }).subscribe({
      next: (result) => {
        this.albums.update(existing => append ? [...existing, ...result.data] : result.data);
        this.total.set(result.count);
      },
    });
  }
}
