import { Injectable } from '@angular/core';
import { BaseStorageService } from './basestorage';

@Injectable({ providedIn: 'root' })
export class LocalStorageService extends BaseStorageService {
  protected storage = localStorage;
}