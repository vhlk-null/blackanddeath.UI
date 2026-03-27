import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BandService } from '../../services/band.service';
import { Band } from '../../../shared/models/band';
import { BandCard } from '../band-card/band-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { Section } from '../../../shared/components/section/section';

const TABS = ['Latest', 'This Year', 'Popular'];
const PAGE_SIZE = 9;

@Component({
  selector: 'app-all-bands',
  templateUrl: './all-bands.html',
  styleUrl: './all-bands.scss',
  imports: [BandCard, Pagination, Section],
})
export class AllBands implements OnInit {
  private bandService = inject(BandService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly tabs = TABS;
  readonly pageSize = PAGE_SIZE;

  readonly bands = signal<Band[]>([]);
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
    this.bandService.getAllPaginated({
      page: this.currentPage(),
      pageSize: this.pageSize,
    }).subscribe({
      next: (result) => {
        this.bands.set(result.data);
        this.total.set(result.count);
      },
    });
  }
}
