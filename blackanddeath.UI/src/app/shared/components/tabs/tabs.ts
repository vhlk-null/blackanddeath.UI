import { Component, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  tabs = input.required<string[]>();
  initialIndex = input<number>(0);
  activeIndex = signal(0);
  tabChange = output<number>();

  constructor() {
    effect(() => {
      this.activeIndex.set(this.initialIndex());
    }, { allowSignalWrites: true });
  }

  setActive(index: number) {
    this.activeIndex.set(index);
    this.tabChange.emit(index);
  }
}
