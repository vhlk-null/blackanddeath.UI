import { Component, input, output, signal, ElementRef, HostListener } from '@angular/core';

export interface CustomSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
})
export class CustomSelect {
  options = input<CustomSelectOption[]>([]);
  value = input<string>('');
  placeholder = input('All');
  valueChange = output<string>();

  readonly isOpen = signal(false);

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  select(value: string): void {
    this.valueChange.emit(value);
    this.isOpen.set(false);
  }

  get selectedLabel(): string {
    if (!this.value()) return this.placeholder();
    return this.options().find(o => o.value === this.value())?.label ?? this.placeholder();
  }
}
