import { Component, inject, signal } from '@angular/core';
import { GenreService } from '../services/genre.service';
import { GenreCardEditor, GenreCardData } from './genre-card-editor/genre-card-editor';
import { TagService } from '../services/tag.service';
import { SelectOption } from '../../shared/components/multi-select/multi-select';
import { AddMetadataForm } from '../create-new-item/add-metadata-form/add-metadata-form';
import { Tabs } from '../../shared/components/tabs/tabs';
import { ApproveData } from './approve-data/approve-data';

@Component({
  selector: 'app-admin',
  imports: [GenreCardEditor, AddMetadataForm, Tabs, ApproveData],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private genreService = inject(GenreService);
  private tagService = inject(TagService);

  readonly tabs = ['Add Metadata', 'Genres to Explore', 'Approve Data'];
  readonly activeTab = signal(0);

  readonly genreCards = signal<GenreCardData[]>([]);
  readonly genreOptions = signal<SelectOption[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  onTabChange(index: number): void {
    this.activeTab.set(index);
    if (index === 1) {
      this.genreService.getCardsDetails().subscribe({
        next: (cards) => this.genreCards.set(cards),
        error: () => {},
      });

      this.genreService.getAll().subscribe({
        next: (genres) => this.genreOptions.set(genres.map(g => ({ id: g.id, name: g.name }))),
        error: () => {},
      });

      this.tagService.getAll().subscribe({
        next: (tags) => this.tagOptions.set(tags.map(t => ({ id: t.id, name: t.name }))),
        error: () => {},
      });
    }
  }

  onCardDeleted(id: string): void {
    this.genreCards.update(cards => cards.filter(c => c.id !== id));
  }

  onCardCreated(event: { tempId: string; realId: string }): void {
    this.genreCards.update(cards => cards.map(c =>
      c.id === event.tempId ? { ...c, id: event.realId, isNew: false } : c
    ));
  }

  onCreate(): void {
    const nextOrder = this.genreCards().length + 1;
    this.genreCards.update(cards => [...cards, {
      id: `new-${Date.now()}`,
      name: 'New Card',
      description: 'New Card',
      coverUrl: null,
      orderNumber: nextOrder,
      genres: [],
      tags: [],
      isNew: true,
    }]);
  }
}
