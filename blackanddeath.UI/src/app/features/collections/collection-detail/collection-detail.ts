import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CollectionService, CollectionDetail } from '../../services/collection.service';
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
}
