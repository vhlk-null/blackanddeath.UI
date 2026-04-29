import { Component, inject, signal, OnInit } from '@angular/core';
import { AlbumService, PendingApprovalDto, PendingApprovalGroup } from '../../services/album.servics';
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

  readonly tabs: ApproveTab[] = ['Albums', 'Bands', 'Videos'];
  readonly activeTab = signal<ApproveTab>('Albums');

  readonly albumGroups = signal<PendingApprovalGroup[]>([]);
  readonly items = signal<PendingApprovalDto[]>([]);
  readonly loading = signal(false);
  readonly collapsedGroups = signal<Set<string>>(new Set());

  toggleGroup(bandId: string): void {
    this.collapsedGroups.update(set => {
      const next = new Set(set);
      next.has(bandId) ? next.delete(bandId) : next.add(bandId);
      return next;
    });
  }

  isCollapsed(bandId: string): boolean {
    return this.collapsedGroups().has(bandId);
  }

  get totalAlbumCount(): number {
    return this.albumGroups().reduce((sum, g) => sum + g.albums.length, 0);
  }

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
      next: () => {
        if (tab === 'Albums') {
          this.albumGroups.update(groups =>
            groups
              .map(g => ({ ...g, albums: g.albums.filter(a => a.id !== item.id) }))
              .filter(g => g.albums.length > 0)
          );
        } else {
          this.items.update(list => list.filter(i => i.id !== item.id));
        }
      },
      error: () => {},
    });
  }

  editUrl(item: PendingApprovalDto): string | null {
    const tab = this.activeTab();
    if (tab === 'Albums') return `/albums/${item.id}/edit`;
    if (tab === 'Bands') return `/bands/${item.id}/edit`;
    return null;
  }

  private loadTab(tab: ApproveTab): void {
    this.loading.set(true);
    this.albumGroups.set([]);
    this.items.set([]);

    if (tab === 'Albums') {
      this.albumService.getPendingApproval().subscribe({
        next: (groups) => {
          this.albumGroups.set(groups);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); },
      });
    } else {
      const request$ = tab === 'Bands'
        ? this.bandService.getPendingApproval()
        : this.videoBandService.getPendingApproval();

      request$.subscribe({
        next: (data) => {
          this.items.set(data);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); },
      });
    }
  }
}
