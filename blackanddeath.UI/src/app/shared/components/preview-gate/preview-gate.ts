import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';

const STORAGE_KEY = 'bd_preview_unlocked';

@Component({
  selector: 'app-preview-gate',
  imports: [FormsModule],
  templateUrl: './preview-gate.html',
  styleUrl: './preview-gate.scss',
})
export class PreviewGate {
  private readonly password = environment.previewPassword;

  readonly required = !!this.password;
  readonly unlocked = signal(localStorage.getItem(STORAGE_KEY) === '1');

  readonly isUnlocked = computed(() => !this.required || this.unlocked());

  input = '';
  error = signal(false);

  submit(): void {
    if (this.input === this.password) {
      localStorage.setItem(STORAGE_KEY, '1');
      this.unlocked.set(true);
    } else {
      this.error.set(true);
      this.input = '';
      setTimeout(() => this.error.set(false), 1200);
    }
  }
}
