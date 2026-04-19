import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
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
import { ReviewService, Review } from '../../services/review.service';
import { CollectionPicker } from '../../../shared/components/collection-picker/collection-picker';
import { CollectionItem, CollectionService } from '../../services/collection.service';
import { Band } from '../../../shared/models/band';
import { BandCard } from '../band-card/band-card';
import { Album } from '../../../shared/models/album';
import {
  BAND_INFORMATION,
  DISCOGRAPHY_TITLE,
  SIMILAR_ALBUMS_TITLE,
  SIMILAR_BANDS_TITLE,
} from '../../../shared/constants/constants';

export interface AlbumReview extends Review {
  albumId: string;
  albumTitle: string;
  albumSlug: string;
}

@Component({
  selector: 'app-band-info',
  imports: [Section, AlbumCard, BandCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe, DatePipe, CollectionPicker],
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
  private reviewService = inject(ReviewService);
  private destroyRef = inject(DestroyRef);
  private collectionService = inject(CollectionService);

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
  readonly showCollectionPicker = signal(false);
  readonly collectionItem = computed<CollectionItem | null>(() => {
    const id = this.bandData()?.id;
    return id ? { id, type: 'band' } : null;
  });

  openCollectionPicker(): void {
    const userId = this.auth.userId();
    if (!userId) return;
    if (this.showCollectionPicker()) { this.showCollectionPicker.set(false); return; }
    if (this.collectionService.all().length > 0) {
      this.showCollectionPicker.set(true);
    } else {
      this.collectionService.loadForUser(userId).subscribe(() => this.showCollectionPicker.set(true));
    }
  }

  // Album reviews aggregated across band's discography
  readonly albumReviews = signal<AlbumReview[]>([]);
  readonly reviewsTotal = signal(0);
  readonly reviewsLoaded = signal(false);
  readonly reviewSort = signal<'newest' | 'oldest' | 'highest-rated' | 'lowest-rated'>('newest');
  readonly expandedReviews = signal<Set<string>>(new Set());

  readonly sortedAlbumReviews = computed(() => {
    const sort = this.reviewSort();
    return [...this.albumReviews()].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sort === 'highest-rated') return (b.userRating ?? 0) - (a.userRating ?? 0);
      if (sort === 'lowest-rated') return (a.userRating ?? 0) - (b.userRating ?? 0);
      return 0;
    });
  });

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

  toggleReviewExpanded(id: string): void {
    this.expandedReviews.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isReviewExpanded(id: string): boolean {
    return this.expandedReviews().has(id);
  }

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
      navigator.clipboard.writeText(window.location.href).then(() => {
        this.shared.set(true);
        setTimeout(() => this.shared.set(false), 2000);
      });
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

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(params => !!params.get('slug')),
      switchMap(params => {
        this.loaded.set(false);
        this.notFound.set(false);
        this.imageError.set(false);
        this.infoTabIndex.set(0);
        this.albumReviews.set([]);
        this.reviewsLoaded.set(false);
        this.reviewsTotal.set(0);
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
        this.isFavorite.set(false);

        const userId = this.auth.userId();
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

  selectTab(index: number): void {
    this.infoTabIndex.set(index);
    if (index === 2 && !this.reviewsLoaded()) {
      this.loadAlbumReviews();
    }
  }

  loadAlbumReviews(): void {
    const bandId = this.bandData()?.id;
    if (!bandId) { this.reviewsLoaded.set(true); return; }

    this.reviewService.getBandReviews(bandId, { pageIndex: 1, pageSize: 100 }).subscribe(r => {
      const reviews: AlbumReview[] = r.data.map(review => ({
        ...review,
        albumId: '',
        albumTitle: '',
        albumSlug: '',
      }));
      this.albumReviews.set(reviews);
      this.reviewsTotal.set(r.count);
      this.reviewsLoaded.set(true);
    });
  }

  deleteAlbumReview(reviewId: string): void {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.reviewService.deleteAlbumReview(reviewId).subscribe({
      next: () => {
        this.albumReviews.update(r => r.filter(x => x.id !== reviewId));
        this.reviewsTotal.update(t => t - 1);
      },
      error: () => this.toastService.error('Failed to delete review.'),
    });
  }

  getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }

  setBandRating(rating: number): void {
    const userId = this.auth.userId();
    if (!userId) { this.toastService.info('Sign in to rate this band.'); return; }
    const bandId = this.bandData()?.id;
    if (!bandId) return;

    this.ratingService.getUserBandRating(bandId, userId).subscribe(r => {
      if (r) {
        this.userRating.set(r.userRating);
        this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
      }
    });

    this.ratingService.rateBand(userId, bandId, rating).subscribe({
      next: () => {
        this.userRating.set(rating);
        this.ratingService.getUserBandRating(bandId, userId).subscribe(r => {
          if (r) this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
        });
      },
      error: () => this.toastService.error('Failed to save rating.'),
    });
  }
}

