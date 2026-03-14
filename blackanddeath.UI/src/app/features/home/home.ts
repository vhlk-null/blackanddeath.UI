import { Component } from '@angular/core';
import { Section } from '../../shared/components/section/section';

@Component({
  selector: 'app-home',
  imports: [Section],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home { }
