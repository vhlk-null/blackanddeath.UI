import { Injectable, inject, signal, computed } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
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

  readonly userId = computed(() => this._profile()?.sub ?? null);

  readonly isAdmin = computed(() => {
    const role = this._profile()?.role;
    if (!role) return false;
    return Array.isArray(role) ? role.includes('admin') : role === 'admin';
  });

  async init(): Promise<void> {
    this.oauth.configure(authConfig);
    this.oauth.strictDiscoveryDocumentValidation = false;
    this.oauth.setStorage(localStorage);

    try {
      await this.oauth.loadDiscoveryDocumentAndTryLogin();

      this._isAuthenticated.set(this.oauth.hasValidAccessToken());

      if (this._isAuthenticated()) {
        await this.loadProfile();
      }

      this.oauth.setupAutomaticSilentRefresh();

      this.oauth.events
        .pipe(filter(e => ['token_received', 'token_refreshed'].includes(e.type)))
        .subscribe(async () => {
          this._isAuthenticated.set(true);
          await this.loadProfile();
        });

      this.oauth.events
        .pipe(filter(e => e.type === 'token_expires'))
        .subscribe(() => {
          this.oauth.refreshToken().catch(() => {
            this._isAuthenticated.set(false);
            this._profile.set(null);
          });
        });

      this.oauth.events
        .pipe(filter(e => e.type === 'logout'))
        .subscribe(() => {
          this._isAuthenticated.set(false);
          this._profile.set(null);
        });

    } catch (err) {
     
    }
  }

  private _loadingProfile = false;

  private async loadProfile(): Promise<void> {
    if (this._loadingProfile) return;
    this._loadingProfile = true;

    const claims = this.oauth.getIdentityClaims() as UserProfile;

    try {
      const response = await this.oauth.loadUserProfile() as { info: UserProfile };
      const userInfo = response?.info ?? (response as unknown as UserProfile);
      this._profile.set({ ...claims, ...userInfo });
    } catch {
      this._profile.set(claims);
    } finally {
      this._loadingProfile = false;
    }
  }

  login(): void {   
    if (!(this.oauth as any).discoveryDocumentLoaded) {
      this.oauth.loadDiscoveryDocument().then(() => {
        this.oauth.initCodeFlow();
      }).catch();
      return;
    }
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.oauth.logOut();
  }

  getAccessToken(): string {
    return this.oauth.getAccessToken();
  }
}
