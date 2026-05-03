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
    { value: 'dark',           label: 'Dark',            description: 'Pure dark background, easy on the eyes' },
    { value: 'dark-gradient',  label: 'Dark Gradient',   description: 'Dark with a subtle purple tint at the top' },
    { value: 'dark-red',       label: 'Dark Red',        description: 'Dark with a deep crimson gradient' },
    { value: 'light',          label: 'Light',           description: 'Light background for bright environments' },
    { value: 'light-gradient', label: 'Light Gradient',  description: 'Light with a soft blue-grey gradient' },
    { value: 'pink',           label: 'Pink',            description: 'A touch of pink in the darkness' },
    { value: 'pink-gradient',  label: 'Pink Gradient',   description: 'Pink with a dreamy gradient wash' },
  ];

  setTheme(t: Theme): void {
    while (this.theme.theme() !== t) {
      this.theme.cycle();
    }
  }
}
