import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

interface MetadataSection {
  title: string;
  items: string[];
  expanded: boolean;
  showAll: boolean;
}

@Component({
  selector: 'app-add-metadata-form',
  templateUrl: './add-metadata-form.html',
  styleUrl: './add-metadata-form.scss',
  imports: [FormsModule]
})
export class AddMetadataForm {

  readonly previewCount = 12;

  readonly sections = signal<MetadataSection[]>([
    {
      title: 'Genres',
      items: ['Death Metal', 'Black Metal', 'Doom Metal', 'Thrash Metal', 'Heavy Metal', 'Power Metal', 'Folk Metal', 'Gothic Metal', 'Symphonic Metal', 'Sludge Metal', 'Post-Metal', 'Grindcore', 'Deathcore', 'Melodic Death Metal'],
      expanded: false,
      showAll: false,
    },
    {
      title: 'Countries',
      items: ['USA', 'Norway', 'Germany', 'Finland', 'Sweden', 'Ukraine', 'UK', 'France', 'Brazil', 'Poland', 'Greece', 'Netherlands', 'Italy', 'Japan', 'Canada', 'Australia', 'Russia', 'Czech Republic', 'Switzerland', 'Austria', 'Spain', 'Portugal', 'Belgium', 'Denmark', 'Iceland'],
      expanded: false,
      showAll: false,
    },
    {
      title: 'Labels',
      items: ['Nuclear Blast', 'Century Media', 'Relapse Records', 'Metal Blade', 'Season of Mist', 'Peaceville Records', 'Candlelight Records', 'Osmose Productions', 'Napalm Records', 'Profound Lore', 'Dark Descent Records', 'Independent'],
      expanded: false,
      showAll: false,
    },
    {
      title: 'Tags',
      items: ['Raw', 'DSBM', 'Atmospheric', 'Melodic', 'Progressive', 'Technical', 'Brutal', 'Depressive', 'Occult'],
      expanded: false,
      showAll: false,
    },
  ]);

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

  visibleItems(section: MetadataSection): string[] {
    return section.showAll ? section.items : section.items.slice(0, this.previewCount);
  }

  removeItem(sectionIndex: number, item: string): void {
    this.sections.update(sections =>
      sections.map((s, i) => i === sectionIndex ? { ...s, items: s.items.filter(x => x !== item) } : s)
    );
  }

  onSubmit(formData: NgForm) {
    console.log(formData.form.value.genre)
  }
}
