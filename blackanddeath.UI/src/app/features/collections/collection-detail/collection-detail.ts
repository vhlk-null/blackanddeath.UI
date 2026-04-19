import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CollectionService, CollectionDetail } from '../../services/collection.service';
import { ToastService } from '../../../shared/services/toast.service';
import { AlbumCard } from '../../albums/card/album-card';
import { BandCard } from '../../bands/band-card/band-card';

@Component({
  selector: 'app-collection-detail',
  imports: [RouterLink, AlbumCard, BandCard],
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.scss',
})
export class CollectionDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private collectionService = inject(CollectionService);
  private toast = inject(ToastService);

  readonly collection = signal<CollectionDetail | null>(null);
  readonly loaded = signal(false);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.notFound.set(true); this.loaded.set(true); return; }
    this.collectionService.getDetail(id).subscribe({
      next: col => { this.collection.set(col); this.loaded.set(true); },
      error: () => { this.notFound.set(true); this.loaded.set(true); },
    });
  }

  removeAlbum(albumId: string): void {
    const col = this.collection();
    if (!col) return;
    this.collectionService.removeAlbum(col.id, albumId).subscribe(() => {
      this.collection.update(c => c ? { ...c, albums: c.albums.filter(a => a.id !== albumId) } : c);
      this.toast.info('Album removed from collection.');
    });
  }

  removeBand(bandId: string): void {
    const col = this.collection();
    if (!col) return;
    this.collectionService.removeBand(col.id, bandId).subscribe(() => {
      this.collection.update(c => c ? { ...c, bands: c.bands.filter(b => b.id !== bandId) } : c);
      this.toast.info('Band removed from collection.');
    });
  }
}
