import {
  Component, inject, input, output, signal, computed,
  HostListener, ElementRef, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionService, CollectionItem } from '../../../features/services/collection.service';

@Component({
  selector: 'app-collection-picker',
  imports: [FormsModule],
  templateUrl: './collection-picker.html',
  styleUrl: './collection-picker.scss',
})
export class CollectionPicker implements OnInit {
  private el = inject(ElementRef);
  readonly collectionService = inject(CollectionService);

  readonly item = input.required<CollectionItem>();
  readonly userId = input.required<string>();
  readonly closed = output<void>();

  readonly collections = computed(() =>
    this.collectionService.all().filter(c => c.collectionType === this.item().type)
  );

  // Tracks which collection IDs already contain this item (loaded via detail or toggled locally)
  readonly checkedIds = signal<Set<string>>(new Set());

  readonly newName = signal('');
  readonly creating = signal(false);
  readonly loading = signal(false);

  ngOnInit(): void {
    // The collections list is already loaded by the parent (album/band info page loads on demand).
    // We don't have a bulk "which collections contain X" endpoint, so start empty —
    // the user sees checkboxes and checks/unchecks as desired.
  }

  isChecked(id: string): boolean {
    return this.checkedIds().has(id);
  }

  toggle(id: string): void {
    const item = this.item();
    if (this.isChecked(id)) {
      const obs = item.type === 'album'
        ? this.collectionService.removeAlbum(id, item.id)
        : this.collectionService.removeBand(id, item.id);
      obs.subscribe(() => this.checkedIds.update(s => { const n = new Set(s); n.delete(id); return n; }));
    } else {
      const obs = item.type === 'album'
        ? this.collectionService.addAlbum(id, item.id)
        : this.collectionService.addBand(id, item.id);
      obs.subscribe(() => this.checkedIds.update(s => new Set([...s, id])));
    }
  }

  startCreating(): void {
    this.creating.set(true);
  }

  confirmCreate(): void {
    const name = this.newName().trim();
    if (!name) return;
    const item = this.item();
    this.collectionService.createCollection(this.userId(), name, this.item().type).subscribe(col => {
      this.newName.set('');
      this.creating.set(false);
      // Immediately add the item to the new collection
      const obs = item.type === 'album'
        ? this.collectionService.addAlbum(col.id, item.id)
        : this.collectionService.addBand(col.id, item.id);
      obs.subscribe(() => this.checkedIds.update(s => new Set([...s, col.id])));
    });
  }

  cancelCreate(): void {
    this.newName.set('');
    this.creating.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.closed.emit();
    }
  }
}
