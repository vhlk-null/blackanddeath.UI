import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Section } from '../../../shared/components/section/section';
import { AlbumCard } from '../card/album-card';
import { BandCard } from '../../bands/band-card/band-card';
import { StarRating } from '../../../shared/components/star-rating/star-rating';
import { AlbumService } from '../../services/album.servics';
import { Album } from '../../../shared/models/album';
import { Band } from '../../../shared/models/band';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import {
  ALBUM_INFORMATION,
  DISCOGRAPHY_TITLE,
  VIDEOS_TITLE,
  SIMILAR_ALBUMS_TITLE,
} from '../../../shared/constants/constants';

@Component({
  selector: 'app-info',
  imports: [Section, AlbumCard, BandCard, StarRating],
  templateUrl: './info.html',
  styleUrl: './info.scss',
})
export class Info implements OnInit {

  private route = inject(ActivatedRoute);
  private albumService = inject(AlbumService);

  readonly tabs = {
    info: ALBUM_INFORMATION,
  };

  readonly titles = {
    discography: DISCOGRAPHY_TITLE,
    videos: VIDEOS_TITLE,
    similarAlbums: SIMILAR_ALBUMS_TITLE,
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
  readonly tracklistTabs = ['Tracklist', 'Spotify', 'Amazon'];

  readonly albumData = signal<Album | null>(null);
  readonly discographyAlbums = signal<Album[]>([]);
  readonly similarAlbums = signal<Album[]>([]);
  readonly videos = signal<Band[]>([]);

  readonly typeLabel = computed(() => {
    const type = this.albumData()?.type;
    return type ? (this.typeLabels[type] ?? type) : '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.albumService.getById(id).subscribe({
      next: (album) => { this.albumData.set(album); this.loaded.set(true); },
      error: (err) => console.error('Failed to load album', err),
    });
  }
}
