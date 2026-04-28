import { Component, inject, input, output, signal, computed } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { Album } from '../../../shared/models/album';
import { AlbumType } from '../../../shared/models/enums/album-type.enum';
import { TitleCaseAllPipe } from '../../../shared/pipes/title-case.pipe';
import { AgeGateService } from '../../../core/services/age-gate.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { CollectionService, CollectionItem } from '../../services/collection.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ContextMenu, ContextMenuItem } from '../../../shared/components/context-menu/context-menu';
import { CollectionPicker } from '../../../shared/components/collection-picker/collection-picker';

@Component({
  selector: 'app-album-card',
  imports: [RouterLink, TitleCaseAllPipe, ContextMenu, CollectionPicker],
  templateUrl: './album-card.html',
  styleUrl: './album-card.scss',
})
export class AlbumCard {
  albumCard = input.required<Album>();
  readonly filterByGenre = output<string>();
  readonly filterByCountry = output<string>();
  readonly filterByType = output<string>();
  readonly filterByYear = output<number>();
  readonly imageError = signal(false);
  readonly ageGate = inject(AgeGateService);

  readonly auth = inject(AuthService);
  private favoriteService = inject(FavoriteService);
  readonly collectionService = inject(CollectionService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly ctxX = signal(0);
  readonly ctxY = signal(0);
  readonly showCtx = signal(false);
  readonly showCollectionPicker = signal(false);

  readonly collectionItem = computed<CollectionItem | null>(() => {
    const a = this.albumCard();
    return a ? { id: a.id, type: 'album' } : null;
  });

  readonly typeLabels: Record<AlbumType, string> = {
    [AlbumType.FullLength]: 'Full-Length',
    [AlbumType.EP]: 'EP',
    [AlbumType.Demo]: 'Demo',
    [AlbumType.Single]: 'Single',
    [AlbumType.Compilation]: 'Compilation',
    [AlbumType.LiveAlbum]: 'Live Album',
    [AlbumType.Split]: 'Split',
  };

  typeLabel(): string {
    return this.typeLabels[this.albumCard().type] ?? '';
  }

  onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    this.ctxX.set(e.clientX);
    this.ctxY.set(e.clientY);
    this.showCtx.set(true);
  }

  get ctxItems(): ContextMenuItem[] {
    const album = this.albumCard();
    const userId = this.auth.userId();
    const items: ContextMenuItem[] = [];

    if (userId) {
      items.push({
        label: 'Add to Favourites',
        icon: 'star',
        action: () => {
          this.favoriteService.addFavoriteAlbum(album.id, userId).subscribe(() => {
            this.toast.success('Added to favourites');
          });
        },
      });

      items.push({
        label: 'Add to Collection',
        icon: 'bookmark',
        action: () => this.showCollectionPicker.set(true),
      });
    }

    if (album.bands?.[0]?.slug) {
      items.push({
        label: 'Open Band Page',
        icon: 'band',
        action: () => this.router.navigate(['/bands', album.bands![0].slug]),
      });
    }

    items.push({
      label: 'Copy Link',
      icon: 'link',
      action: () => {
        const url = `${window.location.origin}/albums/${album.slug}`;
        navigator.clipboard.writeText(url);
        this.toast.success('Link copied');
      },
    });

    return items;
  }
}
