import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { GenreService } from '../../services/genre.service';
import { ToastService } from '../../../shared/services/toast.service';

export interface GenreCardData {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  orderNumber?: number | null;
  genres?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  isNew?: boolean;
}

@Component({
  selector: 'app-genre-card-editor',
  imports: [ReactiveFormsModule, MultiSelectInput, FormsModule],
  templateUrl: './genre-card-editor.html',
  styleUrl: './genre-card-editor.scss',
})
export class GenreCardEditor implements OnInit {
  private genreService = inject(GenreService);
  private toastService = inject(ToastService);

  card = input.required<GenreCardData>();
  genreOptions = input<SelectOption[]>([]);
  tagOptions = input<SelectOption[]>([]);

  deleted = output<string>();
  created = output<{ tempId: string; realId: string }>();

  saving = signal(false);
  deleting = signal(false);
  editingName = signal(false);
  nameValue = signal('');
  orderValue = signal<number | null>(null);
  previewUrl = signal<string | null>(null);
  coverFile: File | null = null;

  private currentGenreIds: string[] = [];
  private currentTagIds: string[] = [];

  readonly form = new FormGroup({
    genreIds: new FormControl<string[]>([], { nonNullable: true }),
    tagIds: new FormControl<string[]>([], { nonNullable: true }),
  });

  ngOnInit(): void {
    this.previewUrl.set(this.card().coverUrl);
    this.nameValue.set(this.card().name);
    this.orderValue.set(this.card().orderNumber ?? null);
    this.currentGenreIds = this.card().genres?.map(g => g.id) ?? [];
    this.currentTagIds = this.card().tags?.map(t => t.id) ?? [];
    this.form.patchValue({
      genreIds: this.currentGenreIds,
      tagIds: this.currentTagIds,
    });
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.coverFile = file;
      this.previewUrl.set(URL.createObjectURL(file));
    }
  }

  onDelete(): void {
    if (!confirm(`Delete "${this.nameValue()}"? This cannot be undone.`)) return;
    if (this.card().isNew) {
      this.deleted.emit(this.card().id);
      return;
    }
    this.deleting.set(true);
    this.genreService.deleteCard(this.card().id).subscribe({
      next: () => {
        this.deleted.emit(this.card().id);
        this.toastService.success('Deleted!');
      },
      error: () => {
        this.toastService.error('Failed to delete.');
        this.deleting.set(false);
      },
    });
  }

  onSave(): void {
    this.saving.set(true);
    const { genreIds, tagIds } = this.form.getRawValue();
    const dto = {
      name: this.nameValue(),
      description: this.card().description || this.nameValue(),
      orderNumber: this.orderValue(),
      genreIds,
      tagIds,
      coverImage: this.coverFile,
    };

    if (this.card().isNew) {
      this.genreService.createCard(dto).subscribe({
        next: (card) => {
          this.created.emit({ tempId: this.card().id, realId: card.id });
          this.coverFile = null;
          this.toastService.success('Saved!');
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to save.');
          this.saving.set(false);
        },
      });
    } else {
      this.genreService.updateCard(this.card().id, dto).subscribe({
        next: () => {
          this.coverFile = null;
          this.toastService.success('Saved!');
          this.saving.set(false);
        },
        error: () => {
          this.toastService.error('Failed to save.');
          this.saving.set(false);
        },
      });
    }
  }
}
