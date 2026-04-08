import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.apiUrl,
  redirectUri: `${window.location.origin}/auth/callback`,
  postLogoutRedirectUri: window.location.origin,
  clientId: 'angular',
  responseType: 'code',
  scope: 'openid profile email roles libraryAPI offline_access',
  useSilentRefresh: true,
  showDebugInformation: true,
};
