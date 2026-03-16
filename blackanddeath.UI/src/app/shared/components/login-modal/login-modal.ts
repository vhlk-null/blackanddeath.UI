import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.html',
  styleUrl: './login-modal.scss',
})
export class LoginModal {
  readonly closed = output<void>();
  readonly mode = signal<'login' | 'register'>('login');

  close(): void {
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('login-overlay')) {
      this.close();
    }
  }
}
