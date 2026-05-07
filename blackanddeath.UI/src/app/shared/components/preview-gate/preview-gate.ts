import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppConfigService } from '../../../core/services/app-config.service';

const STORAGE_KEY = 'bd_preview_unlocked';

@Component({
  selector: 'app-preview-gate',
  imports: [FormsModule],
  templateUrl: './preview-gate.html',
  styleUrl: './preview-gate.scss',
})
export class PreviewGate {
  private appConfig = inject(AppConfigService);

  get required(): boolean { return !!this.appConfig.previewPassword; }

  readonly unlocked = signal(sessionStorage.getItem(STORAGE_KEY) === '1');

  input = '';
  error = signal(false);

  isUnlocked(): boolean {
    return !this.required || this.unlocked();
  }

  submit(): void {
    if (this.input === this.appConfig.previewPassword) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      this.unlocked.set(true);
    } else {
      this.error.set(true);
      this.input = '';
      setTimeout(() => this.error.set(false), 1200);
    }
  }
}
