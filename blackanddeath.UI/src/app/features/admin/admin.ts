import { Component, inject, OnInit, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { GenreService } from '../services/genre.service';
import { GenreCardEditor, GenreCardData } from './genre-card-editor/genre-card-editor';
import { TagService } from '../services/tag.service';
import { ToastService } from '../../shared/services/toast.service';
import { SelectOption } from '../../shared/components/multi-select/multi-select';
import { AddMetadataForm } from '../create-new-item/add-metadata-form/add-metadata-form';
import { Section } from '../../shared/components/section/section';

@Component({
  selector: 'app-admin',
  imports: [GenreCardEditor, FormsModule, AddMetadataForm, Section],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private genreService = inject(GenreService);
  private tagService = inject(TagService);
  private toastService = inject(ToastService);

  readonly tabs = ['Add Metadata', 'Genres to Explore'];
  readonly activeTab = signal(0);

  readonly genreCards = signal<GenreCardData[]>([]);
  readonly genreOptions = signal<SelectOption[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  showCreateForm = false;
  creating = false;
  newCardName = '';
  newCardDescription = '';

  ngOnInit(): void {
    forkJoin({
      cards: this.genreService.getCardsDetails(),
      genres: this.genreService.getAll(),
      tags: this.tagService.getAll(),
    }).subscribe({
      next: ({ cards, genres, tags }) => {
        this.genreCards.set(cards);
        this.genreOptions.set(genres.map(g => ({ id: g.id, name: g.name })));
        this.tagOptions.set(tags.map(t => ({ id: t.id, name: t.name })));
      },
      error: (err) => console.error('Failed to load admin data', err),
    });
  }

  onCreate(): void {
    if (!this.newCardName.trim()) return;
    this.creating = true;

    this.genreService.createCard({
      name: this.newCardName.trim(),
      description: this.newCardDescription.trim() || this.newCardName.trim(),
    }).subscribe({
      next: (card) => {
        this.genreCards.update(cards => [...cards, { ...card, genres: [], tags: [] }]);
        this.toastService.success('Genre card created!');
        this.newCardName = '';
        this.newCardDescription = '';
        this.showCreateForm = false;
        this.creating = false;
      },
      error: () => {
        this.toastService.error('Failed to create genre card.');
        this.creating = false;
      },
    });
  }
}
