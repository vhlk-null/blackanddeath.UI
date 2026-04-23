import { Component, computed, effect, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CollectionPicker } from '../../../shared/components/collection-picker/collection-picker';
import { CollectionItem, CollectionService } from '../../services/collection.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { switchMap, filter, forkJoin, of } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../card/album-card';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { ImageLightbox } from '../../../shared/components/image-lightbox/image-lightbox';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { TitleCaseAllPipe } from '../../../shared/pipes/title-case.pipe';
import { AlbumService } from '../../services/album.servics';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
import { AgeGateService } from '../../../core/services/age-gate.service';
import { RatingService } from '../../services/rating.service';
import { FavoriteService } from '../../services/favorite.service';
import { ReviewService, Review } from '../../services/review.service';
import { CommentService, Comment } from '../../services/comment.service';
import { Album } from '../../../shared/models/album';
import { Band } from '../../../shared/models/band';
import { VideoBand } from '../../../shared/models/video-band';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { StreamingPlatform } from '../../../shared/models/enums/streaming-platform.enum';
import { toEmbedUrl } from '../../../shared/utils/streaming-embed';
import {
  ALBUM_INFORMATION,
  DISCOGRAPHY_TITLE,
  SIMILAR_ALBUMS_TITLE,
  SIMILAR_BANDS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-info',
  imports: [Section, AlbumCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe, TitleCaseAllPipe, DatePipe, CollectionPicker],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  readonly auth = inject(AuthService);
  readonly ageGate = inject(AgeGateService);
  private albumService = inject(AlbumService);
  private ratingService = inject(RatingService);
  private toastService = inject(ToastService);
  private favoriteService = inject(FavoriteService);
  private reviewService = inject(ReviewService);
  private commentService = inject(CommentService);
  private collectionService = inject(CollectionService);

  readonly lightboxSrc = signal<string | null>(null);
  readonly imageError = signal(false);
  readonly copied = signal(false);
  readonly shared = signal(false);
  readonly userRating = signal<number | null>(null);

  readonly tabs = {
    info: ALBUM_INFORMATION,
  };

  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    similarAlbums: SIMILAR_ALBUMS_TITLE,
    similarBands: SIMILAR_BANDS_TITLE,
  };

  readonly typeLabels: Record<AlbumType, string> = {
    [AlbumType.FullLength]: 'Full-Length',
    [AlbumType.EP]: 'EP',
    [AlbumType.Demo]: 'Demo',
    [AlbumType.Single]: 'Single',
    [AlbumType.Compilation]: 'Compilation',
    [AlbumType.LiveAlbum]: 'Live Album',
    [AlbumType.Split]: 'Split',
  };

  readonly showCollectionPicker = signal(false);

  readonly isInAnyCollection = computed(() => {
    const id = this.albumData()?.id;
    if (!id) return false;
    return this.collectionService.all().some(c => c.albums.some(a => a.id === id));
  });

  openCollectionPicker(): void {
    const userId = this.auth.userId();
    if (!userId) return;
    if (this.showCollectionPicker()) { this.showCollectionPicker.set(false); return; }
    this.showCollectionPicker.set(true);
  }

  readonly collectionItem = computed<CollectionItem | null>(() => {
    const id = this.albumData()?.id;
    return id ? { id, type: 'album' } : null;
  });

  readonly infoTabIndex = signal(0);
  readonly tracklistTabIndex = signal(0);
  readonly loaded = signal(false);
  readonly notFound = signal(false);
  readonly tracklistTabs = computed(() => {
    const tabs: string[] = [];
    if (this.albumData()?.tracks?.length) tabs.push('Tracklist');
    if (this.youtubeEmbed()) tabs.push('YouTube');
    if (this.spotifyEmbed()) tabs.push('Spotify');
    if (this.appleMusicEmbed()) tabs.push('Apple Music');
    if (this.amazonMusicEmbed()) tabs.push('Amazon Music');
    if (this.deezerEmbed()) tabs.push('Deezer');
    if (this.bandcampEmbed()) tabs.push('Bandcamp');
    return tabs;
  });

  readonly albumData = signal<Album | null>(null);

  readonly releaseCountdown = computed(() => {
    const album = this.albumData();
    if (!album?.releaseMonth && !album?.releaseDay) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const release = new Date(album.releaseDate, (album.releaseMonth ?? 1) - 1, album.releaseDay ?? 1);
    const days = Math.ceil((release.getTime() - today.getTime()) / 86400000);
    if (days <= 0) return null;
    return days === 1 ? 'tomorrow' : `in ${days} days`;
  });
  readonly discographyAlbums = signal<Album[]>([]);
  readonly discographyExpanded = signal(false);

  readonly discographyGroups = computed(() =>
    this.albumData()?.discographyGroups ?? []
  );

  // For a split group (bandId null, label = "Band A & Band B"), resolve each name to a band link
  resolveSplitBands(label: string): { name: string; slug: string }[] {
    const bands = this.albumData()?.bands ?? [];
    return label.split('&').map(part => {
      const name = part.trim();
      const match = bands.find(b => b.name.toLowerCase() === name.toLowerCase());
      const slug = match?.slug ?? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return { name, slug };
    });
  }

  readonly totalDiscographyAlbums = computed(() =>
    this.discographyGroups().reduce((sum, g) => sum + g.albums.length, 0)
  );
  readonly similarAlbums = signal<Album[]>([]);
  readonly similarBands = signal<Band[]>([]);
  readonly bandVideos = signal<VideoBand[]>([]);
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

  constructor() {
    effect(() => {
      const sort = this.reviewSort();
      if (this.reviewsEverLoaded) {
        this.loadReviews(sort);
      }
    });
  }

  private reviewsEverLoaded = false;

  readonly expandedReviews = signal<Set<string>>(new Set());

  // Comments
  readonly comments = signal<Comment[]>([]);
  readonly commentsTotal = signal(0);
  readonly commentsLoaded = signal(false);
  readonly commentBody = signal('');
  readonly commentSubmitting = signal(false);
  readonly replyingToId = signal<string | null>(null);
  readonly replyingToReply = signal<{ id: string; username: string } | null>(null);
  readonly collapsedReplies = signal<Set<string>>(new Set());

  toggleReplies(commentId: string): void {
    this.collapsedReplies.update(set => {
      const next = new Set(set);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
  }

  areRepliesCollapsed(commentId: string): boolean {
    return this.collapsedReplies().has(commentId);
  }
  readonly replyBody = signal('');
  readonly replySubmitting = signal(false);
  readonly editingCommentId = signal<string | null>(null);
  readonly editCommentBody = signal('');
  readonly editCommentSubmitting = signal(false);

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
    this.reviewService.updateAlbumReview(id, { title, body, userRating }).subscribe({
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


  private getRawLink(platform: StreamingPlatform): string | null {
    const links = this.albumData()?.streamingLinks ?? [];
    return links.find(l =>
      l.platform === platform ||
      (l.platform as unknown as string) === StreamingPlatform[platform]
    )?.embedCode ?? null;
  }

  readonly youtubeEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.YouTube);
    return url ? toEmbedUrl(url, 'YouTube') : null;
  });

  readonly spotifyEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.Spotify);
    return url ? toEmbedUrl(url, 'Spotify') : null;
  });

  readonly amazonMusicEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.AmazonMusic);
    return url ? toEmbedUrl(url, 'AmazonMusic') : null;
  });

  readonly deezerEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.Deezer);
    return url ? toEmbedUrl(url, 'Deezer') : null;
  });

  readonly appleMusicEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.AppleMusic);
    return url ? toEmbedUrl(url, 'AppleMusic') : null;
  });

  readonly bandcampEmbed = computed(() => {
    const url = this.getRawLink(StreamingPlatform.Bandcamp);
    if (!url) return null;
    const embedSrc = toEmbedUrl(url, 'Bandcamp');
    return { embedSrc, rawUrl: url };
  });

  readonly totalDuration = computed(() => {
    const tracks = this.albumData()?.tracks ?? [];
    if (!tracks.length) return null;
    let totalSeconds = 0;
    for (const t of tracks) {
      if (!t.duration) continue;
      const parts = t.duration.split(':').map(Number);
      if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1];
      else if (parts.length === 3) totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (!totalSeconds) return null;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  });

  readonly typeLabel = computed(() => {
    const type = this.albumData()?.type;
    return type ? (this.typeLabels[type] ?? type) : '';
  });

  setAlbumRating(rating: number): void {
    const userId = this.auth.userId();
    if (!userId) { this.toastService.info('Sign in to rate this album.'); return; }
    const albumId = this.albumData()?.id;
    if (!albumId) return;

    const refreshRating = () => {
      this.ratingService.getUserAlbumRating(albumId, userId).subscribe(r => {
        if (r) {
          this.userRating.set(r.userRating);
          this.albumData.update(a => a ? { ...a, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : a);
        }
      });
    };

    const reviewId = this.userReviewId();
    if (reviewId) {
      const existing = this.reviews().find(r => r.id === reviewId);
      this.reviewService.updateAlbumReview(reviewId, { title: existing?.title ?? '', body: existing?.body ?? '', userRating: rating }).subscribe({
        next: (updated) => {
          this.reviews.update(list => list.map(r => r.id === updated.id ? updated : r));
          refreshRating();
        },
        error: () => this.toastService.error('Failed to save rating.'),
      });
    } else {
      const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
      this.reviewService.createAlbumReview({ albumId, userId, username, title: '', body: '', userRating: rating }).subscribe({
        next: (review) => {
          this.userReviewId.set(review.id);
          this.reviews.update(r => [review, ...r]);
          this.reviewService.getAlbumReviewsCount(albumId).subscribe(c => this.reviewsTotal.set(c));
          refreshRating();
        },
        error: () => this.toastService.error('Failed to save rating.'),
      });
    }
  }

  copyLink(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  share(): void {
    if (navigator.share) {
      navigator.share({ url: window.location.href, title: this.albumData()?.title ?? '' });
    } else {
      this.copyLink();
      this.shared.set(true);
      setTimeout(() => this.shared.set(false), 2000);
    }
  }

  toggleFavorite(): void {
    const userId = this.auth.userId();
    const albumId = this.albumData()?.id;
    if (!userId || !albumId) return;

    if (this.isFavorite()) {
      this.favoriteService.removeFavoriteAlbum(albumId, userId)
        .subscribe(() => this.isFavorite.set(false));
    } else {
      this.favoriteService.addFavoriteAlbum(albumId, userId)
        .subscribe(() => this.isFavorite.set(true));
    }
  }

  onDelete(): void {
    const id = this.albumData()?.id;
    if (!id || !confirm('Delete this album?')) return;

    this.albumService.delete(id).subscribe({
      next: () => {
        this.toastService.success('Album deleted.');
        this.router.navigate(['/albums']);
      },
      error: () => this.toastService.error('Failed to delete album.'),
    });
  }

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.pipe(
      filter(params => !!params.get('slug')),
      switchMap(params => {
        this.loaded.set(false);
        this.notFound.set(false);
        this.imageError.set(false);
        this.infoTabIndex.set(0);
        this.reviewsEverLoaded = false;
        return this.albumService.getBySlug(params.get('slug')!, { similarPageSize: 20 });
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (album) => {
        this.albumData.set(album);
        this.titleService.setTitle(album.title ? `${album.title} — Black And Death` : 'Black And Death');
        this.loaded.set(true);
        this.loadComments();
        this.playingVideoId.set(null);
        this.discographyExpanded.set(false);
        this.userRating.set(null);
        this.userReviewId.set(null);

        const discography = album.bands?.flatMap(b => b.discography ?? []) ?? [];
        this.discographyAlbums.set(discography);
        this.similarAlbums.set(album.similarAlbums?.data ?? []);
        this.similarBands.set((album.similarBands ?? []) as any);
        this.bandVideos.set(album.videos);
        this.reviews.set([]);
        this.reviewsLoaded.set(false);
        this.reviewTitle.set('');
        this.reviewBody.set('');
        this.comments.set([]);
        this.commentsLoaded.set(false);
        this.commentBody.set('');
        this.replyingToId.set(null);
        this.replyBody.set('');
        this.editingCommentId.set(null);
        this.reviewService.getAlbumReviewsCount(album.id).subscribe(c => this.reviewsTotal.set(c));

        const userId = this.auth.userId();
        this.isFavorite.set(false);
        if (userId) {
          forkJoin({
            collections: this.collectionService.loadForUser(userId),
            rating: this.ratingService.getUserAlbumRating(album.id, userId),
            reviews: this.reviewService.getAlbumReviews(album.id, { pageIndex: 1, pageSize: 100 }),
            favorite: this.favoriteService.checkFavoriteAlbum(album.id, userId),
          }).subscribe(({ rating, reviews, favorite }) => {
            if (rating) {
              this.userRating.set(rating.userRating);
              this.albumData.update(a => a ? { ...a, averageRating: rating.averageRating, ratingsCount: rating.ratingsCount } : a);
            }
            const mine = reviews.data.find(x => x.userId === userId);
            if (mine) this.userReviewId.set(mine.id);
            this.isFavorite.set(favorite);
          });
        } else {
          this.ratingService.getAlbumAverage(album.id).subscribe(r => {
            if (r) this.albumData.update(a => a ? { ...a, averageRating: r.averageRating, ratingsCount: r.ratingsCount } : a);
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
    if (index === 1 && !this.reviewsLoaded()) {
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
    const albumId = this.albumData()?.id;
    if (!albumId) return;
    const orderBy = this.orderByMap[sort];
    this.reviewService.getAlbumReviews(albumId, { pageIndex: 1, pageSize: 20, orderBy }).subscribe(r => {
      this.reviews.set(r.data);
      this.reviewsTotal.set(r.count);
      this.reviewsLoaded.set(true);
      this.reviewsEverLoaded = true;
    });
  }

  submitReview(): void {
    const userId = this.auth.userId();
    const albumId = this.albumData()?.id;
    if (!userId || !albumId || this.reviewSubmitting()) return;

    const title = this.reviewTitle().trim();
    const body = this.reviewBody().trim();
    if (!title || !body) {
      this.toastService.info('Please fill in title and review text.');
      return;
    }
    const userRating = this.reviewUserRating();

    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    this.reviewSubmitting.set(true);
    this.reviewService.createAlbumReview({ albumId, userId, username, title, body, userRating }).subscribe({
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
    this.reviewService.deleteAlbumReview(reviewId).subscribe({
      next: () => {
        this.reviews.update(r => r.filter(x => x.id !== reviewId));
        this.reviewsTotal.update(t => t - 1);
      },
      error: () => this.toastService.error('Failed to delete review.'),
    });
  }

  loadComments(): void {
    const albumId = this.albumData()?.id;
    if (!albumId) return;
    this.commentService.getAlbumComments(albumId, { pageIndex: 1, pageSize: 50 }).subscribe(r => {
      this.comments.set(r.data);
      this.commentsTotal.set(r.count);
      this.commentsLoaded.set(true);
    });
  }

  submitComment(): void {
    const userId = this.auth.userId();
    const albumId = this.albumData()?.id;
    if (!userId || !albumId || this.commentSubmitting()) return;
    const body = this.commentBody().trim();
    if (!body) return;
    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    this.commentSubmitting.set(true);
    this.commentService.createAlbumComment({ albumId, userId, username, body, parentCommentId: null }).subscribe({
      next: (comment) => {
        this.comments.update(c => [comment, ...c]);
        this.commentsTotal.update(t => t + 1);
        this.commentBody.set('');
        this.commentSubmitting.set(false);
      },
      error: () => { this.commentSubmitting.set(false); this.toastService.error('Failed to post comment.'); },
    });
  }

  submitReply(rootCommentId: string): void {
    const userId = this.auth.userId();
    const albumId = this.albumData()?.id;
    if (!userId || !albumId || this.replySubmitting()) return;
    const body = this.replyBody().trim();
    if (!body) return;
    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    const replyTarget = this.replyingToReply();
    const parentCommentId = replyTarget?.id ?? rootCommentId;
    this.replySubmitting.set(true);
    this.commentService.createAlbumComment({
      albumId, userId, username, body, parentCommentId,
      replyToCommentId: replyTarget?.id ?? null,
      replyToUsername: replyTarget?.username ?? null,
    }).subscribe({
      next: (reply) => {
        this.comments.update(cs => cs.map(c =>
          c.id === rootCommentId ? { ...c, replies: [...c.replies, reply] } : c
        ));
        this.replyBody.set('');
        this.replyingToId.set(null);
        this.replyingToReply.set(null);
        this.replySubmitting.set(false);
      },
      error: () => { this.replySubmitting.set(false); this.toastService.error('Failed to post reply.'); },
    });
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId.set(comment.id);
    this.editCommentBody.set(comment.body);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentBody.set('');
  }

  saveEditComment(commentId: string, parentId: string | null): void {
    const body = this.editCommentBody().trim();
    if (!body || this.editCommentSubmitting()) return;
    this.editCommentSubmitting.set(true);
    this.commentService.updateAlbumComment(commentId, { body }).subscribe({
      next: (updated) => {
        if (parentId) {
          this.comments.update(cs => cs.map(c =>
            c.id === parentId ? { ...c, replies: c.replies.map(r => r.id === commentId ? updated : r) } : c
          ));
        } else {
          this.comments.update(cs => cs.map(c => c.id === commentId ? { ...updated, replies: c.replies } : c));
        }
        this.editingCommentId.set(null);
        this.editCommentBody.set('');
        this.editCommentSubmitting.set(false);
      },
      error: () => { this.editCommentSubmitting.set(false); this.toastService.error('Failed to update comment.'); },
    });
  }

  deleteComment(commentId: string, parentId: string | null): void {
    if (!confirm('Delete this comment?')) return;
    this.commentService.deleteAlbumComment(commentId).subscribe({
      next: () => {
        if (parentId) {
          this.comments.update(cs => cs.map(c =>
            c.id === parentId ? { ...c, replies: c.replies.filter(r => r.id !== commentId) } : c
          ));
        } else {
          this.comments.update(cs => cs.filter(c => c.id !== commentId));
          this.commentsTotal.update(t => t - 1);
        }
      },
      error: () => this.toastService.error('Failed to delete comment.'),
    });
  }

  getYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  }
}
