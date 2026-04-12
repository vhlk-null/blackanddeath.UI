import { Component, computed, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap, filter } from 'rxjs';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../card/album-card';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { ImageLightbox } from '../../../shared/components/image-lightbox/image-lightbox';
import { SafeUrlPipe } from '../../../shared/pipes/safe-url.pipe';
import { TitleCaseAllPipe } from '../../../shared/pipes/title-case.pipe';
import { AlbumService } from '../../services/album.servics';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../core/auth/auth.service';
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
  imports: [Section, AlbumCard, StarRating, ImageLightbox, RouterLink, SafeUrlPipe, TitleCaseAllPipe],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  private albumService = inject(AlbumService);
  private toastService = inject(ToastService);

  readonly lightboxSrc = signal<string | null>(null);
  readonly imageError = signal(false);

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
    if (this.bandcampEmbed()) tabs.push('Bandcamp');
    return tabs;
  });

  readonly albumData = signal<Album | null>(null);
  readonly discographyAlbums = signal<Album[]>([]);
  readonly discographyExpanded = signal(false);

  readonly discographyGroups = computed(() =>
    this.albumData()?.discographyGroups ?? []
  );

  readonly totalDiscographyAlbums = computed(() =>
    this.discographyGroups().reduce((sum, g) => sum + g.albums.length, 0)
  );
  readonly similarAlbums = signal<Album[]>([]);
  readonly similarBands = signal<Band[]>([]);
  readonly bandVideos = signal<VideoBand[]>([]);
  readonly playingVideoId = signal<string | null>(null);

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
      filter(params => !!params.get('id')),
      switchMap(params => {
        this.loaded.set(false);
        return this.albumService.getById(params.get('id')!);
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (album) => {
        const urlSlug = this.route.snapshot.paramMap.get('slug');
        if (album.slug && urlSlug !== album.slug) {
          this.router.navigate(['/albums', album.id, album.slug], { replaceUrl: true });
        }
        this.albumData.set(album);
        this.loaded.set(true);
        this.playingVideoId.set(null);
        this.discographyExpanded.set(false);

        const discography = album.bands?.flatMap(b => b.discography ?? []) ?? [];
        this.discographyAlbums.set(discography);
        this.similarAlbums.set(album.similarAlbums ?? []);
        this.similarBands.set((album.similarBands ?? []) as any);
        this.bandVideos.set(album.videos);
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
}
