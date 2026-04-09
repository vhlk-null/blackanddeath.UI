import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlbumService, PendingApprovalDto } from '../../services/album.servics';
import { BandService } from '../../services/band.service';
import { VideoBandService } from '../../services/video-band.service';
import { Tabs } from '../../../shared/components/tabs/tabs';

type ApproveTab = 'Albums' | 'Bands' | 'Videos';

@Component({
  selector: 'app-approve-data',
  imports: [Tabs],
  templateUrl: './approve-data.html',
  styleUrl: './approve-data.scss',
})
export class ApproveData implements OnInit {
  private albumService = inject(AlbumService);
  private bandService = inject(BandService);
  private videoBandService = inject(VideoBandService);
  private router = inject(Router);

  readonly tabs: ApproveTab[] = ['Albums', 'Bands', 'Videos'];
  readonly activeTab = signal<ApproveTab>('Albums');
  readonly items = signal<PendingApprovalDto[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.loadTab('Albums');
  }

  onTabChange(index: number): void {
    const tab = this.tabs[index];
    this.activeTab.set(tab);
    this.loadTab(tab);
  }

  delete(item: PendingApprovalDto): void {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;

    const tab = this.activeTab();
    const request$ = tab === 'Albums'
      ? this.albumService.delete(item.id)
      : tab === 'Bands'
        ? this.bandService.delete(item.id)
        : null;

    if (!request$) return;

    request$.subscribe({
      next: () => this.items.update(list => list.filter(i => i.id !== item.id)),
      error: (err) => console.error('Failed to delete item', err),
    });
  }

  navigateToEdit(item: PendingApprovalDto): void {
    const tab = this.activeTab();
    if (tab === 'Albums') {
      this.router.navigate(['/albums', item.id, 'edit']);
    } else if (tab === 'Bands') {
      this.router.navigate(['/bands', item.id, 'edit']);
    }
  }

  private loadTab(tab: ApproveTab): void {
    this.loading.set(true);
    const request$ = tab === 'Albums'
      ? this.albumService.getPendingApproval()
      : tab === 'Bands'
        ? this.bandService.getPendingApproval()
        : this.videoBandService.getPendingApproval();

    request$.subscribe({
      next: (data) => {
        this.items.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load pending approval items', err);
        this.loading.set(false);
      },
    });
  }
}
