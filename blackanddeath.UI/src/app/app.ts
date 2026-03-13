import { Component, signal } from '@angular/core';
import { Header } from "./core/components/header/header";

@Component({
  selector: 'app-root',
  imports: [Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('blackanddeath.UI');
}
