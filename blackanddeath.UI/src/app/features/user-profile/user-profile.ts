import { Component, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { CollectionService, CollectionDetail } from '../services/collection.service';
import { UserProfileService, UserProfileDto, mapProfileAlbum, mapProfileBand, mapProfileCollection } from '../services/user-profile.service';
import { AlbumCard } from '../albums/card/album-card';
import { BandCard } from '../bands/band-card/band-card';
import { VideoCard } from '../home/video-card/video-card';
import { Section } from '../../shared/components/section/section';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { VideoBand } from '../../shared/models/video-band';

@Component({
  selector: 'app-user-profile',
  imports: [AlbumCard, BandCard, VideoCard, Section, FormsModule, RouterLink, NgTemplateOutlet],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  readonly auth = inject(AuthService);
  private el = inject(ElementRef);

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent): void {
    const menu = this.el.nativeElement.querySelector('.profile__collections-sort-menu');
    if (menu && !menu.contains(e.target) && !(e.target as Element).closest('.profile__collections-sort-btn')) {
      this.showSortMenu.set(false);
    }
  }
  private profileService = inject(UserProfileService);
  readonly collectionService = inject(CollectionService);

  readonly mainTabs = ['Favourites', 'Playlists', 'Collections', 'Activity'];
  readonly activeMainTab = signal(0);

  readonly isOnline = signal(true);
  readonly profileDto = signal<UserProfileDto | null>(null);

  readonly username = computed(() =>
    this.auth.userName() ?? this.profileDto()?.username ?? 'User'
  );

  readonly stats = computed(() => [
    { label: 'Joined', value: this.profileDto()?.registeredDate ? new Date(this.profileDto()!.registeredDate).getFullYear().toString() : '—' },
    { label: 'Albums', value: String(this.profileDto()?.favoriteAlbumsCount ?? 0) },
    { label: 'Bands', value: String(this.profileDto()?.favoriteBandsCount ?? 0) },
    { label: 'Reviews', value: String(this.profileDto()?.reviewsCount ?? 0) },
  ]);

  readonly collectionSearch = signal('');
  readonly collectionSort = signal<'recent' | 'added' | 'alpha'>('recent');
  readonly showSortMenu = signal(false);

  private filteredSorted(type: 'album' | 'band') {
    return computed(() => {
      const q = this.collectionSearch().toLowerCase().trim();
      const sort = this.collectionSort();
      let cols = this.collectionService.all().filter(c => c.collectionType === type);
      if (q) cols = cols.filter(c => c.name.toLowerCase().includes(q));
      if (sort === 'alpha') cols = [...cols].sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === 'added') cols = [...cols].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return cols;
    });
  }

  readonly albumCollections = this.filteredSorted('album');
  readonly bandCollections = this.filteredSorted('band');

  readonly favoriteAlbums = computed<Album[]>(() =>
    this.profileDto()?.favoriteAlbums.map(mapProfileAlbum) ?? []
  );
  readonly favoriteBands = computed<Band[]>(() =>
    this.profileDto()?.favoriteBands.map(mapProfileBand) ?? []
  );
  readonly favoriteVideos = signal<VideoBand[]>([]);

  // Collections
  readonly creatingCollection = signal(false);
  readonly newCollectionName = signal('');
  readonly newCollectionType = signal<'album' | 'band'>('album');
  readonly newCollectionCoverFile = signal<File | null>(null);
  readonly newCollectionCoverPreview = signal<string | null>(null);
  readonly editingCollectionId = signal<string | null>(null);
  readonly editingCollectionName = signal('');
  readonly editingCollectionCoverFile = signal<File | null>(null);
  readonly editingCollectionCoverPreview = signal<string | null>(null);
  readonly selectedCollection = signal<CollectionDetail | null>(null);
  readonly collectionDetailLoading = signal(false);

  ngOnInit(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    this.profileService.getProfile(userId).subscribe(dto => {
      this.profileDto.set(dto);
      const cols = dto.collections.map(mapProfileCollection);
      this.collectionService.setCollections(cols);
    });
  }

  selectCollection(id: string): void {
    if (this.selectedCollection()?.id === id) return;
    this.collectionDetailLoading.set(true);
    this.collectionService.getDetail(id).subscribe(detail => {
      this.selectedCollection.set(detail);
      this.collectionDetailLoading.set(false);
    });
  }


  onNewCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.newCollectionCoverFile.set(file);
    this.newCollectionCoverPreview.set(URL.createObjectURL(file));
  }

  onHeroCoverChange(event: Event): void {
    const col = this.selectedCollection();
    if (!col) return;
    if (this.editingCollectionId() !== col.id) {
      this.startEditingCollection(col.id, col.name, col.coverUrl);
    }
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editingCollectionCoverFile.set(file);
    this.editingCollectionCoverPreview.set(URL.createObjectURL(file));
  }

  onEditCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.editingCollectionCoverFile.set(file);
    this.editingCollectionCoverPreview.set(URL.createObjectURL(file));
  }

  startCreatingCollection(): void {
    this.creatingCollection.set(true);
    this.newCollectionName.set('');
    this.newCollectionCoverFile.set(null);
    this.newCollectionCoverPreview.set(null);
  }

  confirmCreateCollection(): void {
    const userId = this.auth.userId();
    const name = this.newCollectionName().trim();
    if (!userId || !name) return;
    this.collectionService.createCollection(userId, name, this.newCollectionType(), undefined, this.newCollectionCoverFile()).subscribe(col => {
      this.creatingCollection.set(false);
      this.newCollectionName.set('');
      this.newCollectionType.set('album');
      this.newCollectionCoverFile.set(null);
      this.newCollectionCoverPreview.set(null);
      this.selectCollection(col.id);
    });
  }

  cancelCreateCollection(): void {
    this.creatingCollection.set(false);
    this.newCollectionName.set('');
    this.newCollectionType.set('album');
    this.newCollectionCoverFile.set(null);
    this.newCollectionCoverPreview.set(null);
  }

  startEditingCollection(id: string, currentName: string, currentCoverUrl?: string | null): void {
    this.editingCollectionId.set(id);
    this.editingCollectionName.set(currentName);
    this.editingCollectionCoverFile.set(null);
    this.editingCollectionCoverPreview.set(currentCoverUrl ?? null);
  }

  confirmEditCollection(): void {
    const id = this.editingCollectionId();
    const userId = this.auth.userId();
    const name = this.editingCollectionName().trim();
    if (!id || !userId || !name) return;
    this.collectionService.updateCollection(id, userId, name, undefined, this.editingCollectionCoverFile()).subscribe(updated => {
      this.editingCollectionId.set(null);
      this.editingCollectionName.set('');
      this.editingCollectionCoverFile.set(null);
      this.editingCollectionCoverPreview.set(null);
      if (this.selectedCollection()?.id === id) {
        this.selectedCollection.set(null);
        this.collectionService.getDetail(id).subscribe(detail => this.selectedCollection.set(detail));
      }
    });
  }

  cancelEditCollection(): void {
    this.editingCollectionId.set(null);
    this.editingCollectionName.set('');
    this.editingCollectionCoverFile.set(null);
    this.editingCollectionCoverPreview.set(null);
  }

  removeFromCollection(type: 'album' | 'band', itemId: string): void {
    const col = this.selectedCollection();
    if (!col) return;
    const obs = type === 'album'
      ? this.collectionService.removeAlbum(col.id, itemId)
      : this.collectionService.removeBand(col.id, itemId);
    obs.subscribe(() => {
      this.selectedCollection.update(c => c ? {
        ...c,
        albums: type === 'album' ? c.albums.filter(a => a.id !== itemId) : c.albums,
        bands: type === 'band' ? c.bands.filter(b => b.id !== itemId) : c.bands,
      } : c);
    });
  }

  deleteCollection(id: string): void {
    this.collectionService.deleteCollection(id).subscribe(() => {
      if (this.selectedCollection()?.id === id) {
        this.selectedCollection.set(null);
      }
    });
  }

  placeholders(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  readonly activities = [
    { user: 'JabeGreen', action: 'commented band', target: 'Shamhamforash', time: '2 hours ago' },
    { user: 'JabeGreen', action: 'rated album', target: 'Aether (2015)', time: '2 hours ago' },
    { user: 'JabeGreen', action: 'added album', target: 'The Grand Arc Of Madness (2024) to favourites', time: '3 hours ago' },
    { user: 'JabeGreen', action: 'commented band', target: 'Shaarimoth', time: '3 hours ago' },
    { user: 'JabeGreen', action: 'added to playlist', target: 'De Mysteriis Dom Sathanas → Rituals', time: '5 hours ago' },
  ];
}
