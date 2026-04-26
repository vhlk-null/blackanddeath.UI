import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-copyright',
  imports: [],
  templateUrl: './copyright.html',
  styleUrl: './copyright.scss',
})
export class Copyright {
  constructor(title: Title) {
    title.setTitle('Copyright · Blackened Death Metal');
  }
}
