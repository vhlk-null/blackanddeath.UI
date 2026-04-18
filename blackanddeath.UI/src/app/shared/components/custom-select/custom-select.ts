import { Component, forwardRef, input, output, signal, ElementRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CustomSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomSelect),
    multi: true,
  }],
})
export class CustomSelect implements ControlValueAccessor {
  options = input<CustomSelectOption[]>([]);
  value = input<string>('');
  placeholder = input('All');
  valueChange = output<string>();

  readonly isOpen = signal(false);
  readonly internalValue = signal('');

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  writeValue(val: string): void {
    this.internalValue.set(val ?? '');
  }

  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  toggle(): void {
    this.isOpen.update(v => !v);
    this.onTouched();
  }

  select(value: string): void {
    this.internalValue.set(value);
    this.onChange(value);
    this.valueChange.emit(value);
    this.isOpen.set(false);
  }

  get currentValue(): string {
    return this.internalValue() || this.value();
  }

  get selectedLabel(): string {
    const v = this.currentValue;
    if (!v) return this.placeholder();
    return this.options().find(o => o.value === v)?.label ?? this.placeholder();
  }
}
