import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'age_confirmed';

@Injectable({ providedIn: 'root' })
export class AgeGateService {
  readonly confirmed = signal(localStorage.getItem(STORAGE_KEY) === 'true');
  readonly open = signal(false);

  requestAccess(): void {
    if (!this.confirmed()) this.open.set(true);
  }

  confirm(): void {
    localStorage.setItem(STORAGE_KEY, 'true');
    this.confirmed.set(true);
    this.open.set(false);
  }

  decline(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.confirmed.set(false);
    this.open.set(false);
  }
}
