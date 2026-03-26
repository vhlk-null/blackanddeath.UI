import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { forkJoin } from 'rxjs';
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
      s.items.some((item, i) => item.id !== s.originalItems[i]?.id)
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

  removeItem(sectionIndex: number, itemId: string): void {
    this.sections.update(sections =>
      sections.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(x => x.id !== itemId) } : s)
    );
  }

  discardChanges(): void {
    this.sections.update(sections =>
      sections.map(s => ({ ...s, items: [...s.originalItems] }))
    );
  }

  saveChanges(): void {
    this.sections.update(sections =>
      sections.map(s => ({ ...s, originalItems: [...s.items] }))
    );
  }

  onSubmit(formData: NgForm) {
    console.log(formData.form.value.genre);
  }
}
