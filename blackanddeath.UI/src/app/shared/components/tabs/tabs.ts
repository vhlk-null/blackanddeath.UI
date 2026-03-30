import { Component, input, OnInit, output, signal } from '@angular/core';

@Component({
  selector: 'app-tabs',
  imports: [],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs implements OnInit {
  tabs = input.required<string[]>();
  initialIndex = input<number>(0);
  activeIndex = signal(0);
  tabChange = output<number>();

  ngOnInit(): void {
    this.activeIndex.set(this.initialIndex());
  }

  setActive(index: number) {
    this.activeIndex.set(index);
    this.tabChange.emit(index);
  }
}
