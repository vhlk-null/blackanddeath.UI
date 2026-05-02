import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GenreService } from '../services/genre.service';
import { GenreCardEditor, GenreCardData } from './genre-card-editor/genre-card-editor';
import { TagService } from '../services/tag.service';
import { SelectOption } from '../../shared/components/multi-select/multi-select';
import { AddMetadataForm } from '../create-new-item/add-metadata-form/add-metadata-form';
import { Tabs } from '../../shared/components/tabs/tabs';
import { ApproveData } from './approve-data/approve-data';
import { ImportBand } from './import-band/import-band';
import { AdminUsers } from './users/admin-users';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-admin',
  imports: [GenreCardEditor, AddMetadataForm, Tabs, ApproveData, ImportBand, AdminUsers, DragDropModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  private genreService = inject(GenreService);
  private tagService = inject(TagService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly tabs = ['Approve Data', 'Import Band', 'Genres to Explore', 'Users', 'Add Metadata'];
  readonly activeTab = signal(0);

  readonly genreCards = signal<GenreCardData[]>([]);
  readonly genreOptions = signal<SelectOption[]>([]);
  readonly tagOptions = signal<SelectOption[]>([]);

  ngOnInit(): void {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    const index = tab ? this.tabs.findIndex(t => t === tab) : -1;
    if (index > 0) {
      this.activeTab.set(index);
      this.onTabChange(index, false);
    }
  }

  onTabChange(index: number, updateUrl = true): void {
    this.activeTab.set(index);
    if (updateUrl) {
      this.router.navigate([], {
        queryParams: { tab: index > 0 ? this.tabs[index] : null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
    if (index === 2) {
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

  dropCard(event: CdkDragDrop<GenreCardData[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const cards = [...this.genreCards()];
    moveItemInArray(cards, event.previousIndex, event.currentIndex);
    this.genreCards.set(cards);
    this.genreService.reorderCards(cards.map(c => c.id)).subscribe();
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
