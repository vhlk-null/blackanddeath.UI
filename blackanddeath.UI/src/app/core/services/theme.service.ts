import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal(this.loadTheme());

  readonly isDark = this._isDark.asReadonly();

  toggle(): void {
    const next = !this._isDark();
    this._isDark.set(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
  }

  private loadTheme(): boolean {
    const saved = localStorage.getItem(STORAGE_KEY);
    const isDark = saved ? saved === 'dark' : true;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    return isDark;
  }
}
