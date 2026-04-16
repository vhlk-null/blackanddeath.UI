import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
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
import { AuthService } from '../../../core/auth/auth.service';
import { RatingService } from '../../services/rating.service';
import { FavoriteService } from '../../services/favorite.service';
import { Band } from '../../../shared/models/band';
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
  readonly auth = inject(AuthService);
  private bandService = inject(BandService);
  private toastService = inject(ToastService);
  private ratingService = inject(RatingService);
  private favoriteService = inject(FavoriteService);

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
  readonly imageError = signal(false);
  readonly copied = signal(false);
  readonly shared = signal(false);
  readonly userRating = signal<number | null>(null);
  readonly infoTabIndex = signal(0);
  readonly notFound = signal(false);
  readonly bandData = signal<Band | null>(null);
  readonly discographyExpanded = signal(false);
  readonly similarAlbums = signal<Album[]>([]);
  readonly similarBands = signal<Band[]>([]);
  readonly loaded = signal(false);
  readonly playingVideoId = signal<string | null>(null);
  readonly isFavorite = signal(false);

  /** Albums grouped: own first, then co-artist groups */
  readonly discographyGroups = computed(() => {
    const band = this.bandData();
    if (!band?.albums?.length) return [];
    const bandId = band.id;

    const own = band.albums.filter(a => !a.bandId || a.bandId === bandId);
    const coArtistMap = new Map<string, { bandName: string; albums: typeof own }>();
    for (const a of band.albums) {
      if (a.bandId && a.bandId !== bandId) {
        if (!coArtistMap.has(a.bandId)) {
          coArtistMap.set(a.bandId, { bandName: a.bandName ?? a.bandId, albums: [] });
        }
        coArtistMap.get(a.bandId)!.albums.push(a);
      }
    }
    const groups: { label: string | null; albums: typeof own }[] = [];
    if (own.length) groups.push({ label: null, albums: own });
    for (const g of coArtistMap.values()) {
      groups.push({ label: g.bandName, albums: g.albums });
    }
    return groups;
  });

  readonly totalAlbums = computed(() => this.bandData()?.albums?.length ?? 0);
  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  share(): void {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: this.bandData()?.name ?? '' });
    } else {
      this.copyLink();
      this.shared.set(true);
      setTimeout(() => this.shared.set(false), 2000);
    }
  }

  toggleFavorite(): void {
    const userId = this.auth.userId();
    const bandId = this.bandData()?.id;
    if (!userId || !bandId) return;

    if (this.isFavorite()) {
      this.favoriteService.removeFavoriteBand(bandId, userId)
        .subscribe(() => this.isFavorite.set(false));
    } else {
      this.favoriteService.addFavoriteBand(bandId, userId)
        .subscribe(() => this.isFavorite.set(true));
    }
  }

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
      filter(params => !!params.get('slug')),
      switchMap(params => {
        this.loaded.set(false);
        return this.bandService.getBySlug(params.get('slug')!);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (band) => {
        this.bandData.set(band);
        this.discographyExpanded.set(false);
        this.similarAlbums.set((band.similarAlbums ?? []) as any);
        this.similarBands.set((band.similarBands ?? []) as any);
        this.playingVideoId.set(null);
        this.loaded.set(true);
        this.userRating.set(null);

        const userId = this.auth.userId();
        this.isFavorite.set(false);
        if (userId) {
          this.ratingService.getUserBandRating(band.id, userId).subscribe(r => {
            if (r) {
              this.userRating.set(r.userRating);
              this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
            }
          });
          this.favoriteService.checkFavoriteBand(band.id, userId)
            .subscribe(v => this.isFavorite.set(v));
        } else {
          this.ratingService.getBandAverage(band.id).subscribe(r => {
            if (r) this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
          });
        }
      },
      error: (err) => {
        if (err?.status === 404) {
          this.notFound.set(true);
          this.loaded.set(true);
        }
      },
    });
  }

  getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  setBandRating(rating: number): void {
    const userId = this.auth.userId();
    if (!userId) {
      this.toastService.info('Sign in to rate this band.');
      return;
    }
    const bandId = this.bandData()?.id;
    if (!bandId) return;

    this.ratingService.rateBand(userId, bandId, rating).subscribe({
      next: (r) => {
        this.userRating.set(r.userRating);
        this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
      },
      error: () => this.toastService.error('Failed to save rating.'),
    });
  }
}
