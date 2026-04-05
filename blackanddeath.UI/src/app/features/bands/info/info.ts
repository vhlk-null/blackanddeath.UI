import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, filter } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../../albums/card/album-card';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { ImageLightbox } from '../../../shared/components/image-lightbox/image-lightbox';
import { BandService } from '../../services/band.service';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { ToastService } from '../../../shared/services/toast.service';
import { Band } from '../../../shared/models/band';
import { VideoBand } from '../../../shared/models/video-band';
import { BandCard } from '../band-card/band-card';
import { Album } from '../../../shared/models/album';
import {
  BAND_INFORMATION,
  DISCOGRAPHY_TITLE,
  SIMILAR_ALBUMS_TITLE,
  SIMILAR_BANDS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-band-info',
  imports: [Section, AlbumCard, BandCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class BandInfo implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bandService = inject(BandService);
  private toastService = inject(ToastService);

  readonly tabs = { info: BAND_INFORMATION };
  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    similarAlbums: SIMILAR_ALBUMS_TITLE,
    similarBands: SIMILAR_BANDS_TITLE,
  };

  readonly statusLabels: Record<string, string> = {
    Active: 'Active',
    Disbanded: 'Disbanded',
    OnHold: 'On hold',
    Unknown: 'Unknown',
    ChangedName: 'Changed name',
  };

  readonly lightboxSrc = signal<string | null>(null);
  readonly infoTabIndex = signal(0);
  readonly bandData = signal<Band | null>(null);
  readonly similarAlbums = signal<Album[]>([]);
  readonly similarBands = signal<Band[]>([]);
  readonly loaded = signal(false);
  readonly playingVideoId = signal<string | null>(null);
  onDelete(): void {
    const id = this.bandData()?.id;
    if (!id || !confirm('Delete this band?')) return;

    this.bandService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Band deleted.');
        this.router.navigate(['/bands']);
      },
      error: () => this.toastService.error('Failed to delete band.'),
    });
  }

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(params => !!params.get('id')),
      switchMap(params => {
        this.loaded.set(false);
        return this.bandService.getById(params.get('id')!);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (band) => {
        const urlSlug = this.route.snapshot.paramMap.get('slug');
        if (band.slug && urlSlug !== band.slug) {
          this.router.navigate(['/bands', band.id, band.slug], { replaceUrl: true });
        }
        this.bandData.set(band);
        this.similarAlbums.set((band.similarAlbums ?? []) as any);
        this.similarBands.set((band.similarBands ?? []) as any);
        this.playingVideoId.set(null);
        this.loaded.set(true);
      },
      error: (err) => console.error('Failed to load band', err),
    });
  }

  getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}
