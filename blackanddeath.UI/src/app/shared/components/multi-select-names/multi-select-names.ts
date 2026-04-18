import { Component, computed, ElementRef, input, model, signal, viewChild } from '@angular/core';

export interface NameGroup {
  label: string;
  items: string[];
  selectable?: boolean;
}

@Component({
  selector: 'app-multi-select-names',
  templateUrl: './multi-select-names.html',
  styleUrl: './multi-select-names.scss',
})
export class MultiSelectNames {
  options = input<string[]>([]);
  groups = input<NameGroup[]>([]);
  placeholder = input('Search...');
  selected = model<string[]>([]);

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('inputRef');

  readonly query = signal('');
  readonly isOpen = signal(false);

  readonly flatOptions = computed<string[]>(() => {
    const g = this.groups();
    if (g.length) return g.flatMap(gr => gr.items);
    return this.options();
  });

  readonly filteredGroups = computed<NameGroup[]>(() => {
    const q = this.query().toLowerCase().trim();
    const sel = new Set(this.selected());
    const g = this.groups();

    if (g.length) {
      return g.map(gr => ({
        label: gr.label,
        selectable: !sel.has(gr.label) && (!q || gr.label.toLowerCase().includes(q)),
        items: gr.items.filter(i => !sel.has(i) && (!q || i.toLowerCase().includes(q))),
      })).filter(gr => gr.selectable || gr.items.length > 0);
    }

    const items = this.options().filter(o => !sel.has(o) && (!q || o.toLowerCase().includes(q)));
    return items.length ? [{ label: '', items }] : [];
  });

  readonly hasResults = computed(() => this.filteredGroups().some(g => g.items.length > 0));

  focusInput(): void { this.inputRef()?.nativeElement.focus(); }
  onFocus(): void { this.isOpen.set(true); }
  onBlur(): void { setTimeout(() => this.isOpen.set(false), 150); }

  selectGroup(event: Event, name: string): void { event.preventDefault(); this.select(name); }

  select(name: string): void {
    this.selected.update(prev => [...prev, name]);
    this.query.set('');
    this.inputRef()?.nativeElement.focus();
  }

  remove(name: string, event: Event): void {
    event.stopPropagation();
    this.selected.update(prev => prev.filter(s => s !== name));
  }
}
