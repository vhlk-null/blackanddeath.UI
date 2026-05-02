import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AlbumService, PendingApprovalDto, PendingApprovalGroup } from '../../services/album.servics';
import { BandService } from '../../services/band.service';
import { VideoBandService } from '../../services/video-band.service';
import { Tabs } from '../../../shared/components/tabs/tabs';
import { forkJoin } from 'rxjs';

type ApproveTab = 'Albums' | 'Bands' | 'Videos';

@Component({
  selector: 'app-approve-data',
  imports: [Tabs, DatePipe],
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
  readonly selectedIds = signal<Set<string>>(new Set());

  readonly allAlbumIds = computed(() =>
    this.albumGroups().flatMap(g => g.albums.map(a => a.id))
  );

  readonly allSelected = computed(() => {
    const ids = this.activeTab() === 'Albums'
      ? this.allAlbumIds()
      : this.items().map(i => i.id);
    return ids.length > 0 && ids.every(id => this.selectedIds().has(id));
  });

  readonly someSelected = computed(() => this.selectedIds().size > 0);

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

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelect(id: string): void {
    this.selectedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelectAll(): void {
    const ids = this.activeTab() === 'Albums'
      ? this.allAlbumIds()
      : this.items().map(i => i.id);
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(ids));
    }
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
    this.deleteIds([item.id]);
  }

  deleteSelected(): void {
    const count = this.selectedIds().size;
    if (!confirm(`Delete ${count} item${count !== 1 ? 's' : ''}? This cannot be undone.`)) return;
    this.deleteIds([...this.selectedIds()]);
  }

  private deleteIds(ids: string[]): void {
    const tab = this.activeTab();
    const requests = ids.map(id =>
      tab === 'Albums'
        ? this.albumService.delete(id)
        : tab === 'Bands'
          ? this.bandService.delete(id)
          : null
    ).filter((r): r is NonNullable<typeof r> => r !== null);

    if (!requests.length) return;

    forkJoin(requests).subscribe({
      next: () => {
        const deleted = new Set(ids);
        if (tab === 'Albums') {
          this.albumGroups.update(groups =>
            groups
              .map(g => ({ ...g, albums: g.albums.filter(a => !deleted.has(a.id)) }))
              .filter(g => g.albums.length > 0)
          );
        } else {
          this.items.update(list => list.filter(i => !deleted.has(i.id)));
        }
        this.selectedIds.update(set => {
          const next = new Set(set);
          ids.forEach(id => next.delete(id));
          return next;
        });
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
    this.selectedIds.set(new Set());

    if (tab === 'Albums') {
      this.albumService.getPendingApproval().subscribe({
        next: (groups) => { this.albumGroups.set(groups); this.loading.set(false); },
        error: () => { this.loading.set(false); },
      });
    } else {
      const request$ = tab === 'Bands'
        ? this.bandService.getPendingApproval()
        : this.videoBandService.getPendingApproval();

      request$.subscribe({
        next: (data) => { this.items.set(data); this.loading.set(false); },
        error: () => { this.loading.set(false); },
      });
    }
  }
}
