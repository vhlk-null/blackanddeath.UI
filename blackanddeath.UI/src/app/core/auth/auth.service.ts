import { Injectable, inject, signal, computed } from '@angular/core';
import { OAuthService, EventType } from 'angular-oauth2-oidc';
import { filter } from 'rxjs';
import { authConfig } from './auth.config';

export interface UserProfile {
  sub: string;
  name?: string;
  preferred_username?: string;
  email?: string;
  role?: string | string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly oauth = inject(OAuthService);

  private readonly _isAuthenticated = signal(false);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  private readonly _profile = signal<UserProfile | null>(null);
  readonly profile = this._profile.asReadonly();

  readonly userName = computed(() => {
    const p = this._profile();
    return p?.preferred_username ?? p?.name ?? p?.email ?? null;
  });

  readonly isAdmin = computed(() => {
    const role = this._profile()?.role;
    if (!role) return false;
    return Array.isArray(role) ? role.includes('admin') : role === 'admin';
  });

  async init(): Promise<void> {
    this.oauth.configure(authConfig);
    this.oauth.setupAutomaticSilentRefresh();

    try {
      await this.oauth.loadDiscoveryDocumentAndTryLogin();

      this._isAuthenticated.set(this.oauth.hasValidAccessToken());

      if (this._isAuthenticated()) {
        await this.loadProfile();
      }

      const tokenEvents: EventType[] = ['token_received', 'token_refreshed', 'logout'];
      this.oauth.events
        .pipe(filter(e => tokenEvents.includes(e.type)))
        .subscribe(async e => {
          const authenticated = this.oauth.hasValidAccessToken();
          this._isAuthenticated.set(authenticated);
          if (authenticated && e.type !== 'logout') {
            await this.loadProfile();
          } else {
            this._profile.set(null);
          }
        });
    } catch {
      // IS недоступний — застосунок працює в анонімному режимі
    }
  }

  private async loadProfile(): Promise<void> {
    const claims = this.oauth.getIdentityClaims() as UserProfile;
    try {
      const userInfo = await this.oauth.loadUserProfile() as UserProfile;
      this._profile.set({ ...claims, ...userInfo });
    } catch {
      this._profile.set(claims);
    }
  }

  login(): void {
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.oauth.logOut();
  }

  getAccessToken(): string {
    return this.oauth.getAccessToken();
  }
}
