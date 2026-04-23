import {
  Component, input, output, HostListener, ElementRef, inject, OnInit, signal
} from '@angular/core';

export interface ContextMenuItem {
  label: string;
  icon?: 'star' | 'bookmark' | 'band' | 'link' | 'trash';
  action: () => void;
  danger?: boolean;
}

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.html',
  styleUrl: './context-menu.scss',
})
export class ContextMenu implements OnInit {
  private el = inject(ElementRef);

  readonly x = input.required<number>();
  readonly y = input.required<number>();
  readonly items = input.required<ContextMenuItem[]>();
  readonly closed = output<void>();

  readonly adjustedX = signal(0);
  readonly adjustedY = signal(0);

  ngOnInit(): void {
    setTimeout(() => {
      const el = this.el.nativeElement.querySelector('.ctx-menu') as HTMLElement;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let x = this.x();
      let y = this.y();
      if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
      if (y + rect.height > window.innerHeight) y = window.innerHeight - rect.height - 8;
      this.adjustedX.set(x);
      this.adjustedY.set(y);
    });
    this.adjustedX.set(this.x());
    this.adjustedY.set(this.y());
  }

  run(item: ContextMenuItem): void {
    item.action();
    this.closed.emit();
  }

  @HostListener('document:mousedown', ['$event'])
  onOutside(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    this.closed.emit();
  }
}
