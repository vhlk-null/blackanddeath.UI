import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.issuer,
  redirectUri: `${window.location.origin}/auth/callback`,
  postLogoutRedirectUri: window.location.origin,
  silentRefreshRedirectUri: `${window.location.origin}/silent-refresh.html`,
  clientId: 'angular',
  responseType: 'code',
  scope: 'openid profile email roles blackeneddeath.api offline_access',
  useSilentRefresh: true,
  silentRefreshTimeout: 5000,
  sessionChecksEnabled: false,
  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,
};