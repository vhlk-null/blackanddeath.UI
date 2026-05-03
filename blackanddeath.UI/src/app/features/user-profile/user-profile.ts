import { Component, inject, signal, computed, OnInit, HostListener, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasteImageDirective } from '../../shared/directives/paste-image.directive';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgTemplateOutlet } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { CollectionService, CollectionDetail } from '../services/collection.service';
import { FavoriteService } from '../services/favorite.service';
import { UserProfileService, UserProfileDto, mapProfileAlbum, mapProfileBand, mapProfileCollection } from '../services/user-profile.service';
import { Album } from '../../shared/models/album';
import { Band } from '../../shared/models/band';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

type SidebarEntry =
  | { kind: 'fav-albums' }
  | { kind: 'fav-bands' }
  | { kind: 'collection'; id: string };

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule, RouterLink, NgTemplateOutlet, PasteImageDirective, DragDropModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  readonly auth = inject(AuthService);
  private el = inject(ElementRef);

  readonly isMobile = () => window.innerWidth <= 768;

  @HostListener('document:mousedown', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.showSortMenu()) return;
    const wrap = this.el.nativeElement.querySelector('.profile__collections-sort-wrap');
    if (wrap && !wrap.contains(e.target as Node)) this.showSortMenu.set(false);
  }

  private profileService = inject(UserProfileService);
  private titleService = inject(Title);
  readonly collectionService = inject(CollectionService);
  private favoriteService = inject(FavoriteService);

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

  readonly selected = signal<SidebarEntry>({ kind: 'fav-albums' });

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

  readonly selectedKind = computed(() => this.selected().kind);

  readonly confirmDialog = signal<{ message: string; action: () => void } | null>(null);

  confirm(message: string, action: () => void): void {
    this.confirmDialog.set({ message, action });
  }

  confirmYes(): void {
    this.confirmDialog()?.action();
    this.confirmDialog.set(null);
  }

  confirmNo(): void {
    this.confirmDialog.set(null);
  }

  ngOnInit(): void {
    const userId = this.auth.userId();
    if (!userId) return;

    this.profileService.getProfile(userId).subscribe(dto => {
      this.profileDto.set(dto);
      this.titleService.setTitle(`${dto.username} — Black And Death`);
      const cols = dto.collections.map(mapProfileCollection);
      this.collectionService.setCollections(cols);
    });
  }

  readonly mobilePanelOpen = signal(false);

  selectFav(kind: 'fav-albums' | 'fav-bands'): void {
    this.selected.set({ kind });
    this.selectedCollection.set(null);
    this.mobilePanelOpen.set(true);
  }

  selectCollection(id: string): void {
    if (this.selected().kind === 'collection' && (this.selected() as any).id === id) return;
    this.selected.set({ kind: 'collection', id });
    this.collectionDetailLoading.set(true);
    this.mobilePanelOpen.set(true);
    this.collectionService.getDetail(id).subscribe(detail => {
      this.selectedCollection.set(detail);
      this.collectionDetailLoading.set(false);
    });
  }

  mobileBack(): void {
    this.mobilePanelOpen.set(false);
  }

  onNewCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.onNewCoverPasted(file);
  }

  onNewCoverPasted(file: File): void {
    this.newCollectionCoverFile.set(file);
    this.newCollectionCoverPreview.set(URL.createObjectURL(file));
  }

  onHeroCoverChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.onHeroCoverPasted(file);
  }

  onHeroCoverPasted(file: File): void {
    const col = this.selectedCollection();
    if (!col) return;
    if (this.editingCollectionId() !== col.id) {
      this.startEditingCollection(col.id, col.name, col.coverUrl);
    }
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
    this.collectionService.updateCollection(id, userId, name, undefined, this.editingCollectionCoverFile()).subscribe(() => {
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

  dropFavoriteAlbum(event: CdkDragDrop<Album[]>): void {
    const dto = this.profileDto();
    const userId = this.auth.userId();
    if (!dto || !userId || event.previousIndex === event.currentIndex) return;
    const albums = [...dto.favoriteAlbums];
    moveItemInArray(albums, event.previousIndex, event.currentIndex);
    this.profileDto.set({ ...dto, favoriteAlbums: albums });
    this.favoriteService.reorderFavoriteAlbums(userId, albums.map(a => a.albumId)).subscribe();
  }

  dropFavoriteBand(event: CdkDragDrop<Band[]>): void {
    const dto = this.profileDto();
    const userId = this.auth.userId();
    if (!dto || !userId || event.previousIndex === event.currentIndex) return;
    const bands = [...dto.favoriteBands];
    moveItemInArray(bands, event.previousIndex, event.currentIndex);
    this.profileDto.set({ ...dto, favoriteBands: bands });
    this.favoriteService.reorderFavoriteBands(userId, bands.map(b => b.bandId)).subscribe();
  }

  dropCollectionAlbum(event: CdkDragDrop<Album[]>): void {
    const col = this.selectedCollection();
    if (!col || event.previousIndex === event.currentIndex) return;
    const albums = [...col.albums];
    moveItemInArray(albums, event.previousIndex, event.currentIndex);
    this.selectedCollection.set({ ...col, albums });
    this.collectionService.reorderAlbums(col.id, albums.map(a => a.id)).subscribe();
  }

  dropCollectionBand(event: CdkDragDrop<Band[]>): void {
    const col = this.selectedCollection();
    if (!col || event.previousIndex === event.currentIndex) return;
    const bands = [...col.bands];
    moveItemInArray(bands, event.previousIndex, event.currentIndex);
    this.selectedCollection.set({ ...col, bands });
    this.collectionService.reorderBands(col.id, bands.map(b => b.id)).subscribe();
  }

  removeFavoriteAlbum(albumId: string, title: string): void {
    this.confirm(`Remove "${title}" from favourites?`, () => {
      const userId = this.auth.userId();
      if (!userId) return;
      this.favoriteService.removeFavoriteAlbum(albumId, userId).subscribe(() => {
        this.profileDto.update(dto => dto ? {
          ...dto,
          favoriteAlbums: dto.favoriteAlbums.filter(a => a.albumId !== albumId),
          favoriteAlbumsCount: dto.favoriteAlbumsCount - 1,
        } : dto);
      });
    });
  }

  removeFavoriteBand(bandId: string, name: string): void {
    this.confirm(`Remove "${name}" from favourites?`, () => {
      const userId = this.auth.userId();
      if (!userId) return;
      this.favoriteService.removeFavoriteBand(bandId, userId).subscribe(() => {
        this.profileDto.update(dto => dto ? {
          ...dto,
          favoriteBands: dto.favoriteBands.filter(b => b.bandId !== bandId),
          favoriteBandsCount: dto.favoriteBandsCount - 1,
        } : dto);
      });
    });
  }

  removeFromCollection(type: 'album' | 'band', itemId: string, name: string): void {
    this.confirm(`Remove "${name}" from collection?`, () => {
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
    });
  }

  deleteCollection(id: string, name: string): void {
    this.confirm(`Delete collection "${name}"?`, () => {
      this.collectionService.deleteCollection(id).subscribe(() => {
        if (this.selectedCollection()?.id === id) {
          this.selectedCollection.set(null);
          this.selected.set({ kind: 'fav-albums' });
        }
      });
    });
  }
}
