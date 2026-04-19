import {
  Component, inject, input, output, signal, computed,
  HostListener, ElementRef, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CollectionService, CollectionItem } from '../../../features/services/collection.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-collection-picker',
  imports: [FormsModule],
  templateUrl: './collection-picker.html',
  styleUrl: './collection-picker.scss',
})
export class CollectionPicker implements OnInit {
  private el = inject(ElementRef);
  readonly collectionService = inject(CollectionService);
  private toast = inject(ToastService);

  readonly item = input.required<CollectionItem>();
  readonly userId = input.required<string>();
  readonly closed = output<void>();

  readonly collections = computed(() =>
    this.collectionService.all().filter(c => c.collectionType === this.item().type)
  );

  readonly checkedIds = signal<Set<string>>(new Set());
  readonly newName = signal('');
  readonly creating = signal(false);
  readonly loading = signal(false);

  ngOnInit(): void {
    const itemId = this.item().id;
    const itemType = this.item().type;
    const preChecked = new Set(
      this.collectionService.all()
        .filter(c => c.collectionType === itemType)
        .filter(c => itemType === 'album' ? c.albums.some(a => a.id === itemId) : c.bands.some(b => b.id === itemId))
        .map(c => c.id)
    );
    this.checkedIds.set(preChecked);
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
      const name = this.collections().find(c => c.id === id)?.name ?? 'collection';
      obs.subscribe(() => { this.checkedIds.update(s => { const n = new Set(s); n.delete(id); return n; }); this.toast.info(`Removed from "${name}"`); });
    } else {
      const name = this.collections().find(c => c.id === id)?.name ?? 'collection';
      const obs = item.type === 'album'
        ? this.collectionService.addAlbum(id, item.id)
        : this.collectionService.addBand(id, item.id);
      obs.subscribe(() => { this.checkedIds.update(s => new Set([...s, id])); this.toast.success(`Added to "${name}"`); });
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
      obs.subscribe(() => { this.checkedIds.update(s => new Set([...s, col.id])); this.toast.success(`Added to "${col.name}"`); });
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
