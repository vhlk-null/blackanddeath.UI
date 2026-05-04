// auth.service.ts — виправлена версія
import { Injectable, inject, signal, computed } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { filter } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';

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
  private readonly appConfig = inject(AppConfigService);

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
    this.oauth.configure({
      issuer: this.appConfig.issuer,
      redirectUri: `${window.location.origin}/auth/callback`,
      postLogoutRedirectUri: window.location.origin,
      clientId: 'blackened-death', // ← відповідає ClientId в appsettings.json
      responseType: 'code',
      scope: 'openid profile email roles blackeneddeath.api offline_access',
      useSilentRefresh: false,
      sessionChecksEnabled: false,
      showDebugInformation: false,
      strictDiscoveryDocumentValidation: false,
      requireHttps: false,
      timeoutFactor: 0.75,
      oidc: true,
    });

    // localStorage — прийнятно якщо є CSP, альтернатива sessionStorage
    // якщо хочеш щоб токен жив між вкладками/перезавантаженнями
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
      // Логуємо помилку — не проковтуємо мовчки
      console.error('[AuthService] Initialization failed:', err);
    }
  }

  private _refreshTimer: ReturnType<typeof setTimeout> | null = null;

  private scheduleTokenRefresh(): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);

    const expiresAt = this.oauth.getAccessTokenExpiration();
    if (!expiresAt) return;

    // Оновлюємо за 30 секунд до закінчення
    const delay = expiresAt - Date.now() - 30_000;

    if (delay <= 0) {
      this.doRefresh();
      return;
    }

    this._refreshTimer = setTimeout(() => this.doRefresh(), delay);
  }
  

  private doRefresh(): void {
    this.oauth.refreshToken()
      .then(async () => {
        this._isAuthenticated.set(true);
        await this.loadProfile();
        this.scheduleTokenRefresh();
      })
      .catch((err) => {
        console.warn('[AuthService] Token refresh failed, redirecting to login:', err);
        this._isAuthenticated.set(false);
        this._profile.set(null);
        // Після невдалого refresh — перелогінити, а не залишати без токена
        this.login();
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
      // Фолбек на claims з ID token якщо userinfo endpoint недоступний
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