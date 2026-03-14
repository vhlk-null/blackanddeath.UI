import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  tabs = input.required<string[]>();
  activeIndex = signal(0);
  tabChange = output<number>();

  setActive(index: number) {
    this.activeIndex.set(index);
    this.tabChange.emit(index);
  }
}
