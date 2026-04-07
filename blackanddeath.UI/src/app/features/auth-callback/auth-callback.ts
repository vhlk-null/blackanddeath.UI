import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <div class="auth-callback">
      <p>Authenticating...</p>
    </div>
  `,
  styles: [`
    .auth-callback {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: var(--font-family-body);
      color: var(--color-text-muted);
    }
  `]
})
export class AuthCallback implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.auth.init();
    await this.router.navigateByUrl('/');
  }
}
