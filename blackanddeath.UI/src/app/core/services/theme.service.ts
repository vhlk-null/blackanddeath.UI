import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'dark' | 'light' | 'pink';
const THEMES: Theme[] = ['dark', 'light', 'pink'];
const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.loadTheme());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  cycle(): void {
    const current = this._theme();
    const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    this._theme.set(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  /** @deprecated use cycle() */
  toggle(): void { this.cycle(); }

  private loadTheme(): Theme {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme: Theme = THEMES.includes(saved as Theme) ? (saved as Theme) : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }
}
