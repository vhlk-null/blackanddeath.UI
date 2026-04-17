import { Component, effect, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
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
  imports: [Section, AlbumCard, BandCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe, DatePipe],
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

  // Reviews
  readonly userReviewId = signal<string | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly reviewsTotal = signal(0);
  readonly reviewsLoaded = signal(false);
  readonly reviewTitle = signal('');
  readonly reviewBody = signal('');
  readonly reviewUserRating = computed(() => this.userRating() ?? 0);
  readonly reviewSubmitting = signal(false);
  readonly hasUserReview = computed(() => this.reviews().some(r => r.userId === this.auth.userId()));
  readonly reviewSort = signal<'newest' | 'oldest' | 'highest-rated' | 'lowest-rated'>('newest');

  private reviewsEverLoaded = false;

  constructor() {
    effect(() => {
      const sort = this.reviewSort();
      if (this.reviewsEverLoaded) {
        this.loadReviews(sort);
      }
    });
  }
  readonly expandedReviews = signal<Set<string>>(new Set());

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

  readonly editingReviewId = signal<string | null>(null);
  readonly editTitle = signal('');
  readonly editBody = signal('');
  readonly editUserRating = signal(0);
  readonly editSubmitting = signal(false);

  startEditReview(review: { id: string; title: string; body: string; userRating: number | null }): void {
    this.editingReviewId.set(review.id);
    this.editTitle.set(review.title);
    this.editBody.set(review.body);
    this.editUserRating.set(review.userRating ?? 0);
  }

  cancelEditReview(): void {
    this.editingReviewId.set(null);
  }

  saveEditReview(): void {
    const id = this.editingReviewId();
    if (!id || this.editSubmitting()) return;
    const title = this.editTitle().trim();
    const body = this.editBody().trim();
    if (!title || !body) { this.toastService.info('Please fill in title and review text.'); return; }
    this.editSubmitting.set(true);
    const userRating = this.editUserRating();
    this.reviewService.updateBandReview(id, { title, body, userRating }).subscribe({
      next: (updated) => {
        this.reviews.update(r => r.map(x => x.id === id ? updated : x));
        this.userRating.set(updated.userRating);
        this.editingReviewId.set(null);
        this.editSubmitting.set(false);
        this.toastService.success('Review updated.');
      },
      error: () => {
        this.editSubmitting.set(false);
        this.toastService.error('Failed to update review.');
      },
    });
  }


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
        this.userReviewId.set(null);
        this.reviews.set([]);
        this.reviewsLoaded.set(false);
        this.reviewTitle.set('');
        this.reviewBody.set('');
        this.reviewService.getBandReviewsCount(band.id).subscribe(c => this.reviewsTotal.set(c));

        const userId = this.auth.userId();
        this.isFavorite.set(false);
        if (userId) {
          this.ratingService.getUserBandRating(band.id, userId).subscribe(r => {
            if (r) {
              this.userRating.set(r.userRating);
              this.bandData.update(b => b ? { ...b, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : b);
            }
          });
          this.reviewService.getBandReviews(band.id, { pageIndex: 1, pageSize: 100 }).subscribe(r => {
            const mine = r.data.find(x => x.userId === userId);
            if (mine) this.userReviewId.set(mine.id);
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
      this.loadReviews();
    }
  }

  private readonly orderByMap: Record<string, string> = {
    'newest': 'Newest',
    'oldest': 'Oldest',
    'highest-rated': 'HighestRated',
    'lowest-rated': 'LowestRated',
  };

  loadReviews(sort = this.reviewSort()): void {
    const bandId = this.bandData()?.id;
    if (!bandId) return;
    const orderBy = this.orderByMap[sort];
    this.reviewService.getBandReviews(bandId, { pageIndex: 1, pageSize: 20, orderBy }).subscribe(r => {
      this.reviews.set(r.data);
      this.reviewsTotal.set(r.count);
      this.reviewsLoaded.set(true);
      this.reviewsEverLoaded = true;
    });
  }

  submitReview(): void {
    const userId = this.auth.userId();
    const bandId = this.bandData()?.id;
    if (!userId || !bandId || this.reviewSubmitting()) return;

    const title = this.reviewTitle().trim();
    const body = this.reviewBody().trim();
    if (!title || !body) {
      this.toastService.info('Please fill in title and review text.');
      return;
    }
    const userRating = this.reviewUserRating();

    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    this.reviewSubmitting.set(true);
    this.reviewService.createBandReview({ bandId, userId, username, title, body, userRating }).subscribe({
      next: (review) => {
        this.reviews.update(r => [review, ...r]);
        this.reviewsTotal.update(t => t + 1);
        this.userRating.set(review.userRating);
        this.userReviewId.set(review.id);
        this.reviewTitle.set('');
        this.reviewBody.set('');
        this.reviewSubmitting.set(false);
        this.toastService.success('Review submitted.');
      },
      error: () => {
        this.reviewSubmitting.set(false);
        this.toastService.error('Failed to submit review.');
      },
    });
  }

  deleteReview(reviewId: string): void {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.reviewService.deleteBandReview(reviewId).subscribe({
      next: () => {
        this.reviews.update(r => r.filter(x => x.id !== reviewId));
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
    const reviewId = this.userReviewId();
    if (!reviewId) return;
    const existing = this.reviews().find(r => r.id === reviewId);
    this.reviewService.updateBandReview(reviewId, { title: existing?.title ?? '', body: existing?.body ?? '', userRating: rating }).subscribe({
      next: (updated) => {
        this.userRating.set(updated.userRating);
        this.reviews.update(list => list.map(r => r.id === updated.id ? updated : r));
      },
      error: () => this.toastService.error('Failed to save rating.'),
    });
  }
}
