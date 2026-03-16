import { Component, input, output } from '@angular/core';
import { Tabs } from '../tabs/tabs';

@Component({
  selector: 'app-section',
  imports: [Tabs],
  templateUrl: './section.html',
  styleUrl: './section.scss',
})
export class Section {
  sectionTitle = input.required<string>();
  tabs = input<string[]>();
  columns = input<number>(4);
  tabChange = output<number>();
}
