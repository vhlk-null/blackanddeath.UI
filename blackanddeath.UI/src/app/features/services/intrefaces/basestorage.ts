import { Injectable, signal } from '@angular/core';
import { IStorageActionOptions, IStorageChangeEvent } from './types';

@Injectable({
  providedIn: 'root',
})
export abstract class BaseStorageService {
  protected abstract storage: Storage;

  public lastChange = signal<IStorageChangeEvent | null>(null);

  public set(key: any, value: unknown, options?: IStorageActionOptions): void {
    this.storage.setItem(key, JSON.stringify(value));

    if (options?.emit ?? true) {
      this.lastChange.set({ action: 'set', key, value, modified: true });
    }
  }

  public get<T>(key: any): T | null {
    try {
      const raw = this.storage.getItem(key);
      const val = raw ? JSON.parse(raw) as T : null;

      this.lastChange.set({ action: 'get', key, value: val, modified: false });
      return val;
    } catch {
      return null;
    }
  }

  public remove(key: any, options?: IStorageActionOptions): void {
    this.storage.removeItem(key);

    if (options?.emit ?? true) {
      this.lastChange.set({ action: 'remove', key, modified: true });
    }
  }

  public clear(options?: IStorageActionOptions): void {
    this.storage.clear();

    if (options?.emit ?? true) {
      this.lastChange.set({ action: 'clear', modified: true });
    }
  }
}
