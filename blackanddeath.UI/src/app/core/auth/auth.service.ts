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

      this.scheduleTokenRefresh();

      this.oauth.events
        .pipe(filter(e => e.type === 'logout'))
        .subscribe(() => {
          this._isAuthenticated.set(false);
          this._profile.set(null);
        });

    } catch (err) {
     
    }
  }

  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleTokenRefresh(): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
    const expiresAt = this.oauth.getAccessTokenExpiration();
    if (!expiresAt) return;
    const delay = expiresAt - Date.now() - 30_000;
    if (delay <= 0) { this.doRefresh(); return; }
    this._refreshTimer = setTimeout(() => this.doRefresh(), delay);
  }

  private doRefresh(): void {
    this.oauth.refreshToken()
      .then(() => {
        this._isAuthenticated.set(true);
        const claims = this.oauth.getIdentityClaims() as UserProfile;
        if (claims) this._profile.set(claims);
        this.scheduleTokenRefresh();
      })
      .catch(() => {
        this._isAuthenticated.set(false);
        this._profile.set(null);
      });
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
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.oauth.logOut();
  }

  getAccessToken(): string {
    return this.oauth.getAccessToken();
  }
}
