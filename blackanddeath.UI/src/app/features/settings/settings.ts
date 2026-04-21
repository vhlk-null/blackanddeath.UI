import { Component, inject } from '@angular/core';
import { ThemeService, Theme } from '../../core/services/theme.service';
import { AgeGateService } from '../../core/services/age-gate.service';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly theme = inject(ThemeService);
  readonly ageGate = inject(AgeGateService);

  readonly themes: { value: Theme; label: string; description: string }[] = [
    { value: 'dark', label: 'Dark', description: 'Dark background, easy on the eyes' },
    { value: 'light', label: 'Light', description: 'Light background for bright environments' },
    { value: 'pink', label: 'Pink', description: 'A touch of color in the darkness' },
  ];

  setTheme(t: Theme): void {
    while (this.theme.theme() !== t) {
      this.theme.cycle();
    }
  }
}
