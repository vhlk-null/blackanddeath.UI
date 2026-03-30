import { Component, computed, effect, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-multi-select',
  templateUrl: './multi-select.html',
  styleUrl: './multi-select.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectInput),
    multi: true,
  }],
})
export class MultiSelectInput implements ControlValueAccessor {
  options = input<SelectOption[]>([]);
  placeholder = input('Search...');
  allowCreate = input(false);

  readonly create = output<string>();

  readonly query = signal('');
  readonly selected = signal<SelectOption[]>([]);
  readonly isOpen = signal(false);

  private pendingIds: string[] = [];

  constructor() {
    effect(() => {
      const opts = this.options();
      if (opts.length > 0 && this.pendingIds.length > 0) {
        this.resolveSelected(this.pendingIds);
        this.pendingIds = [];
      }
    });
  }

  readonly filtered = computed(() => {
    const q = this.query().toLowerCase().trim();
    const selectedIds = new Set(this.selected().map(s => s.id));
    return this.options()
      .filter(o => !selectedIds.has(o.id) && (!q || o.name.toLowerCase().includes(q)))
;
  });

  readonly canCreate = computed(() => {
    const q = this.query().trim();
    return this.allowCreate() &&
      q.length > 0 &&
      !this.options().some(o => o.name.toLowerCase() === q.toLowerCase());
  });

  private onChange: (ids: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(ids: string[] | null): void {
    const value = ids ?? [];
    if (this.options().length > 0) {
      this.resolveSelected(value);
    } else {
      this.pendingIds = value;
    }
  }

  registerOnChange(fn: (ids: string[]) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  onFocus(): void {
    this.isOpen.set(true);
  }

  onBlur(): void {
    setTimeout(() => {
      this.isOpen.set(false);
      this.onTouched();
    }, 150);
  }

  requestCreate(): void {
    const name = this.query().trim();
    if (name) {
      this.create.emit(name);
      this.query.set('');
    }
  }

  select(option: SelectOption): void {
    this.selected.update(prev => [...prev, option]);
    this.query.set('');
    this.emit();
  }

  remove(item: SelectOption, event: Event): void {
    event.stopPropagation();
    this.selected.update(prev => prev.filter(s => s.id !== item.id));
    this.emit();
  }

  private resolveSelected(ids: string[]): void {
    const matched = ids
      .map(id => this.options().find(o => o.id === id))
      .filter((o): o is SelectOption => !!o);
    this.selected.set(matched);
  }

  private emit(): void {
    this.onChange(this.selected().map(s => s.id));
  }
}
