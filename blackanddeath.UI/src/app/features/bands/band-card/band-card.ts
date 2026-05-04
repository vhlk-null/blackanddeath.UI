import { Component, inject, input, output, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Band } from '../../../shared/models/band';
import { AuthService } from '../../../core/auth/auth.service';
import { FavoriteService } from '../../services/favorite.service';
import { CollectionService, CollectionItem } from '../../services/collection.service';
import { ToastService } from '../../../shared/services/toast.service';
import { ContextMenu, ContextMenuItem } from '../../../shared/components/context-menu/context-menu';
import { CollectionPicker } from '../../../shared/components/collection-picker/collection-picker';

@Component({
  selector: 'app-band-card',
  imports: [RouterLink, ContextMenu, CollectionPicker],
  templateUrl: './band-card.html',
  styleUrl: './band-card.scss',
})
export class BandCard {
  bandCard = input.required<Band>();
  readonly filterByGenre = output<string>();
  readonly filterByCountry = output<string>();
  readonly filterByYear = output<number>();
  readonly imageError = signal(false);

  readonly auth = inject(AuthService);
  private favoriteService = inject(FavoriteService);
  readonly collectionService = inject(CollectionService);
  private toast = inject(ToastService);

  readonly ctxX = signal(0);
  readonly ctxY = signal(0);
  readonly showCtx = signal(false);
  readonly showCollectionPicker = signal(false);

  readonly collectionItem = computed<CollectionItem | null>(() => {
    const b = this.bandCard();
    return b ? { id: b.id, type: 'band' } : null;
  });

  onContextMenu(e: MouseEvent): void {
    e.preventDefault();
    this.ctxX.set(e.clientX);
    this.ctxY.set(e.clientY);
    this.showCtx.set(true);
  }

  get ctxItems(): ContextMenuItem[] {
    const band = this.bandCard();
    const userId = this.auth.userId();
    const items: ContextMenuItem[] = [];

    if (userId) {
      items.push({
        label: 'Add to Favourites',
        icon: 'star',
        action: () => {
          this.favoriteService.addFavoriteBand(band.id, userId).subscribe(() => {
            this.toast.success('Added to favourites');
          });
        },
      });

      items.push({
        label: 'Add to Collection',
        icon: 'bookmark',
        action: () => this.showCollectionPicker.set(true),
      });

      items.push({
        label: 'Subscribe to Updates',
        icon: 'bell',
        action: () => {
          this.toast.success(`Subscribed to ${band.name} updates`);
        },
      });
    }

    items.push({
      label: 'Copy Link',
      icon: 'link',
      action: () => {
        const url = `${window.location.origin}/bands/${band.slug}`;
        navigator.clipboard.writeText(url);
        this.toast.success('Link copied');
      },
    });

    return items;
  }
}
