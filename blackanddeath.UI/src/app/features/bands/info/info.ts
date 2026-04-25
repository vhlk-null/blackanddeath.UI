import { Component, inject, OnInit, signal, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { switchMap, filter, forkJoin } from 'rxjs';
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
import { CommentService, Comment } from '../../services/comment.service';
import { CommentNode } from '../../../shared/components/comment-node/comment-node';
import { CommentNodeContext } from '../../../shared/components/comment-node/comment-node.context';
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
  imports: [Section, AlbumCard, BandCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe, DatePipe, CollectionPicker, CommentNode],
  templateUrl: './info.html',
  styleUrl: './info.scss',
  providers: [CommentNodeContext],
})
export class BandInfo implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  readonly auth = inject(AuthService);
  private bandService = inject(BandService);
  private toastService = inject(ToastService);
  private ratingService = inject(RatingService);
  private favoriteService = inject(FavoriteService);
  private reviewService = inject(ReviewService);
  private commentService = inject(CommentService);
  private commentNodeCtx = inject(CommentNodeContext);
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

  readonly isInAnyCollection = computed(() => {
    const id = this.bandData()?.id;
    if (!id) return false;
    return this.collectionService.all().some(c => c.bands.some(b => b.id === id));
  });

  openCollectionPicker(): void {
    const userId = this.auth.userId();
    if (!userId) return;
    if (this.showCollectionPicker()) { this.showCollectionPicker.set(false); return; }
    this.showCollectionPicker.set(true);
  }

  // Comments
  readonly comments = signal<Comment[]>([]);
  readonly commentsTotal = signal(0);
  readonly commentSort = signal<'newest' | 'oldest' | 'top'>('newest');
  readonly sortedComments = computed(() => {
    const list = [...this.comments()];
    const sort = this.commentSort();
    if (sort === 'oldest') return list.reverse();
    if (sort === 'top') return list.slice().sort((a, b) => b.likes - a.likes);
    return list;
  });
  readonly commentsLoaded = signal(false);
  readonly commentBody = signal('');
  readonly commentSubmitting = signal(false);
  readonly replyingToId = signal<string | null>(null);
  readonly replyingToReply = signal<{ id: string; username: string } | null>(null);
  readonly replyBody = signal('');
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
  readonly replySubmitting = signal(false);
  readonly editingCommentId = signal<string | null>(null);
  readonly editCommentBody = signal('');
  readonly editCommentSubmitting = signal(false);
  readonly composerFocused = signal(false);

  autoGrow(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
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
    const ctx = this.commentNodeCtx;
    ctx.auth = this.auth;
    ctx.replyingToId = this.replyingToId;
    ctx.replyingToReply = this.replyingToReply;
    ctx.replyBody = this.replyBody;
    ctx.replySubmitting = this.replySubmitting;
    ctx.editingCommentId = this.editingCommentId;
    ctx.editCommentBody = this.editCommentBody;
    ctx.editCommentSubmitting = this.editCommentSubmitting;
    ctx.submitReply = (rootId) => this.submitReply(rootId);
    ctx.reactToComment = (id, isLike) => this.reactToComment(id, isLike);
    ctx.startEditComment = (c) => this.startEditComment(c);
    ctx.cancelEditComment = () => this.cancelEditComment();
    ctx.saveEditComment = (id, parentId) => this.saveEditComment(id, parentId);
    ctx.deleteComment = (id, parentId) => this.deleteComment(id, parentId);
    ctx.autoGrow = (el) => this.autoGrow(el);

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
        this.comments.set([]);
        this.commentsLoaded.set(false);
        this.commentBody.set('');
        this.composerFocused.set(false);
        this.replyingToId.set(null);
        this.replyBody.set('');
        this.editingCommentId.set(null);
        return this.bandService.getBySlug(params.get('slug')!);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (band) => {
        this.bandData.set(band);
        this.titleService.setTitle(band.name ? `${band.name} — Black And Death` : 'Black And Death');
        this.loadComments();
        this.discographyExpanded.set(false);
        this.similarAlbums.set((band.similarAlbums ?? []) as any);
        this.similarBands.set((band.similarBands ?? []) as any);
        this.playingVideoId.set(null);
        this.loaded.set(true);
        this.userRating.set(null);
        this.isFavorite.set(false);

        const userId = this.auth.userId();
        if (userId) {
          forkJoin({
            collections: this.collectionService.loadForUser(userId),
            rating: this.ratingService.getUserBandRating(band.id, userId),
            favorite: this.favoriteService.checkFavoriteBand(band.id, userId),
          }).subscribe(({ rating, favorite }) => {
            if (rating) {
              this.userRating.set(rating.userRating);
              this.bandData.update(b => b ? { ...b, averageRating: rating.averageRating, ratingsCount: rating.ratingsCount } : b);
            }
            this.isFavorite.set(favorite);
          });
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

  loadComments(): void {
    const bandId = this.bandData()?.id;
    if (!bandId) return;
    const userId = this.auth.userId() ?? undefined;
    this.commentService.getBandComments(bandId, { pageIndex: 1, pageSize: 50, userId }).subscribe(r => {
      this.comments.set(r.data);
      this.commentsTotal.set(r.count);
      this.commentsLoaded.set(true);
    });
  }

  submitComment(): void {
    const userId = this.auth.userId();
    const bandId = this.bandData()?.id;
    if (!userId || !bandId || this.commentSubmitting()) return;
    const body = this.commentBody().trim();
    if (!body) return;
    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    this.commentSubmitting.set(true);
    this.commentService.createBandComment({ bandId, userId, username, body, parentCommentId: null }).subscribe({
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
    const bandId = this.bandData()?.id;
    if (!userId || !bandId || this.replySubmitting()) return;
    const body = this.replyBody().trim();
    if (!body) return;
    const username = this.auth.profile()?.preferred_username ?? this.auth.profile()?.name ?? 'User';
    const replyTarget = this.replyingToReply();
    const parentCommentId = replyTarget?.id ?? rootCommentId;
    this.replySubmitting.set(true);
    this.commentService.createBandComment({
      bandId, userId, username, body, parentCommentId,
      replyToCommentId: replyTarget?.id ?? null,
      replyToUsername: replyTarget?.username ?? null,
    }).subscribe({
      next: (newReply) => {
        const insertReply = (c: Comment): Comment => {
          if (c.id === (replyTarget?.id ?? rootCommentId)) {
            return { ...c, replies: [...c.replies, newReply] };
          }
          return { ...c, replies: c.replies.map(r => insertReply(r)) };
        };
        this.comments.update(cs => cs.map(c => c.id === rootCommentId ? insertReply(c) : c));
        this.replyBody.set('');
        this.replyingToId.set(null);
        this.replyingToReply.set(null);
        this.replySubmitting.set(false);
      },
      error: () => { this.replySubmitting.set(false); this.toastService.error('Failed to post reply.'); },
    });
  }

  reactToComment(commentId: string, isLike: boolean): void {
    const userId = this.auth.userId();
    if (!userId) return;

    const updateReaction = (c: Comment): Comment => {
      if (c.id !== commentId) return { ...c, replies: c.replies.map(r => updateReaction(r)) };
      const prev = c.userReaction;
      if (prev === isLike) {
        this.commentService.removeBandCommentReaction(commentId, userId).subscribe();
        return { ...c, userReaction: null, likes: isLike ? c.likes - 1 : c.likes, dislikes: !isLike ? c.dislikes - 1 : c.dislikes };
      } else {
        this.commentService.reactBandComment(commentId, { userId, isLike }).subscribe();
        return {
          ...c,
          userReaction: isLike,
          likes: isLike ? c.likes + 1 : (prev === true ? c.likes - 1 : c.likes),
          dislikes: !isLike ? c.dislikes + 1 : (prev === false ? c.dislikes - 1 : c.dislikes),
        };
      }
    };

    this.comments.update(cs => cs.map(c => updateReaction(c)));
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
    this.commentService.updateBandComment(commentId, { body }).subscribe({
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
    this.commentService.deleteBandComment(commentId).subscribe({
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
}

