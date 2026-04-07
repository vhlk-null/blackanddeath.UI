import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormDirtyService {
  private readonly _dirty = signal(false);
  readonly dirty = this._dirty.asReadonly();

  markDirty(): void  { this._dirty.set(true); }
  markClean(): void  { this._dirty.set(false); }
}
