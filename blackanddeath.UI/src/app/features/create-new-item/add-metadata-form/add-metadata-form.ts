import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { GenreService } from '../../services/genre.service';
import { CountryService } from '../../services/country.service';
import { LabelService } from '../../services/label.service';
import { TagService } from '../../services/tag.service';

interface MetadataItem {
  id: string;
  name: string;
}

interface MetadataSection {
  title: string;
  items: MetadataItem[];
  originalItems: MetadataItem[];
  expanded: boolean;
  showAll: boolean;
}

function makeSection(title: string, items: MetadataItem[]): MetadataSection {
  return { title, items: [...items], originalItems: [...items], expanded: false, showAll: false };
}

@Component({
  selector: 'app-add-metadata-form',
  templateUrl: './add-metadata-form.html',
  styleUrl: './add-metadata-form.scss',
  imports: [FormsModule]
})
export class AddMetadataForm implements OnInit {

  readonly previewCount = 12;

  readonly editingId = signal<string | null>(null);
  readonly editingValue = signal('');

  private toast = inject(ToastService);
  private genreService = inject(GenreService);
  private countryService = inject(CountryService);
  private labelService = inject(LabelService);
  private tagService = inject(TagService);

  readonly sections = signal<MetadataSection[]>([
    makeSection('Genres', []),
    makeSection('Countries', []),
    makeSection('Labels', []),
    makeSection('Tags', []),
  ]);

  readonly hasChanges = computed(() =>
    this.sections().some(s =>
      s.items.length !== s.originalItems.length ||
      s.items.some((item, i) => {
        const orig = s.originalItems[i];
        return !orig || item.id !== orig.id || item.name !== orig.name;
      })
    )
  );

  ngOnInit(): void {
    forkJoin({
      genres: this.genreService.getAll(),
      countries: this.countryService.getAll(),
      labels: this.labelService.getAll(),
      tags: this.tagService.getAll(),
    }).subscribe({
      next: ({ genres, countries, labels, tags }) => {
        this.sections.update(sections => sections.map(s => {
          if (s.title === 'Genres') {
            const items = genres.map(g => ({ id: g.id, name: g.name }));
            return { ...s, items: [...items], originalItems: [...items] };
          }
          if (s.title === 'Countries') {
            const items = countries.map(c => ({ id: c.id, name: c.name }));
            return { ...s, items: [...items], originalItems: [...items] };
          }
          if (s.title === 'Labels') {
            const items = labels.map(l => ({ id: l.id, name: l.name }));
            return { ...s, items: [...items], originalItems: [...items] };
          }
          if (s.title === 'Tags') {
            const items = tags.map(t => ({ id: t.id, name: t.name }));
            return { ...s, items: [...items], originalItems: [...items] };
          }
          return s;
        }));
      },
      error: (err) => console.error('Failed to load metadata', err),
    });
  }

  toggle(index: number): void {
    this.sections.update(sections =>
      sections.map((s, i) => i === index ? { ...s, expanded: !s.expanded, showAll: false } : s)
    );
  }

  toggleShowAll(index: number): void {
    this.sections.update(sections =>
      sections.map((s, i) => i === index ? { ...s, showAll: !s.showAll } : s)
    );
  }

  visibleItems(section: MetadataSection): MetadataItem[] {
    return section.showAll ? section.items : section.items.slice(0, this.previewCount);
  }

  startEdit(item: MetadataItem): void {
    this.editingId.set(item.id);
    this.editingValue.set(item.name);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingValue.set('');
  }

  confirmEdit(sectionIndex: number, item: MetadataItem): void {
    const newName = this.editingValue().trim();
    if (!newName || newName === item.name) {
      this.cancelEdit();
      return;
    }

    this.sections.update(sections => sections.map((s, i) => {
      if (i !== sectionIndex) return s;
      const items = s.items.map(x => x.id === item.id ? { ...x, name: newName } : x);
      return { ...s, items };
    }));
    this.cancelEdit();
  }

  removeItem(sectionIndex: number, itemId: string): void {
    this.sections.update(sections =>
      sections.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(x => x.id !== itemId) } : s)
    );
  }

  discardChanges(): void {
    this.sections.update(sections =>
      sections.map(s => ({ ...s, items: [...s.originalItems] }))
    );
    this.toast.info('Changes discarded');
  }

  saveChanges(): void {
    const services: Record<string, { delete: (id: string) => Observable<any>; update: (id: string, name: string) => Observable<any> }> = {
      'Genres':    { delete: (id) => this.genreService.delete(id),    update: (id, name) => this.genreService.update(id, { name }) },
      'Countries': { delete: (id) => this.countryService.delete(id),  update: (id, name) => this.countryService.update(id, { name }) },
      'Labels':    { delete: (id) => this.labelService.delete(id),    update: (id, name) => this.labelService.update(id, { name }) },
      'Tags':      { delete: (id) => this.tagService.delete(id),      update: (id, name) => this.tagService.update(id, { name }) },
    };

    const calls: Observable<any>[] = [];

    for (const section of this.sections()) {
      const svc = services[section.title];

      for (const orig of section.originalItems) {
        const current = section.items.find(x => x.id === orig.id);
        if (!current) {
          calls.push(svc.delete(orig.id));
        } else if (current.name !== orig.name) {
          calls.push(svc.update(orig.id, current.name));
        }
      }
    }

    if (!calls.length) return;

    forkJoin(calls).subscribe({
      next: () => {
        this.sections.update(sections =>
          sections.map(s => ({ ...s, originalItems: [...s.items] }))
        );
        this.toast.success('Changes saved successfully');
      },
      error: () => this.toast.error('Failed to save changes'),
    });
  }

  onSubmit(formData: NgForm) {
    const { genre, tag, label, country } = formData.form.value;

    const requests: Record<string, Observable<{ id: string }>> = {};
    const names: Record<string, string> = {};

    if (genre?.trim()) { requests['Genres'] = this.genreService.create({ name: genre.trim(), parentGenreId: null }); names['Genres'] = genre.trim(); }
    if (tag?.trim()) { requests['Tags'] = this.tagService.create({ name: tag.trim() }); names['Tags'] = tag.trim(); }
    if (label?.trim()) { requests['Labels'] = this.labelService.create({ name: label.trim() }); names['Labels'] = label.trim(); }
    if (country?.trim()) { requests['Countries'] = this.countryService.create({ name: country.trim(), code: '' }); names['Countries'] = country.trim(); }

    if (!Object.keys(requests).length) {
      this.toast.warning('Fill in at least one field');
      return;
    }

    forkJoin(requests).subscribe({
      next: (created: Record<string, { id: string }>) => {
        this.sections.update(sections => sections.map(s => {
          const result = created[s.title];
          if (!result) return s;
          const newItem = { id: result.id, name: names[s.title] };
          const items = [...s.items, newItem];
          return { ...s, items, originalItems: [...items] };
        }));
        formData.resetForm();
        this.toast.success('Metadata added successfully');
      },
      error: () => this.toast.error('Failed to add metadata'),
    });
  }
}
