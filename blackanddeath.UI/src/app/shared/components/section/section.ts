import { Component, input, output, signal, viewChild, ElementRef } from '@angular/core';
import { Tabs } from '../tabs/tabs';

@Component({
  selector: 'app-section',
  imports: [Tabs],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {
  sectionTitle = input<string>('');
  tabs = input<string[]>();
  initialTab = input<number>(0);
  columns = input<number>(4);
  arrows = input<boolean>(true);
  scroll = input<boolean>(true);
  tabChange = output<number>();

  hovered = signal(false);
  contentEl = viewChild<ElementRef<HTMLElement>>('contentEl');

  scrollContent(direction: -1 | 1): void {
    const el = this.contentEl()?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' });
  }
}
