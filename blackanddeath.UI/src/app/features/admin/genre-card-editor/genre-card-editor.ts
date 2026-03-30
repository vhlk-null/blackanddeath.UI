import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectInput, SelectOption } from '../../../shared/components/multi-select/multi-select';
import { GenreService } from '../../services/genre.service';
import { ToastService } from '../../../shared/services/toast.service';

export interface GenreCardData {
  id: string;
  name: string;
  description: string;
  coverUrl: string | null;
  genres?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
}

@Component({
  selector: 'app-genre-card-editor',
  imports: [ReactiveFormsModule, MultiSelectInput],
  templateUrl: './genre-card-editor.html',
  styleUrl: './genre-card-editor.scss',
})
export class GenreCardEditor implements OnInit {
  private genreService = inject(GenreService);
  private toastService = inject(ToastService);

  card = input.required<GenreCardData>();
  genreOptions = input<SelectOption[]>([]);
  tagOptions = input<SelectOption[]>([]);

  saving = signal(false);
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

  onSave(): void {
    this.saving.set(true);
    const cardId = this.card().id;
    const { genreIds, tagIds } = this.form.getRawValue();

    this.genreService.updateCard(cardId, {
      name: this.card().name,
      description: this.card().description,
      genreIds,
      tagIds,
      coverImage: this.coverFile,
    }).subscribe({
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
