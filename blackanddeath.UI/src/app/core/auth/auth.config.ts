import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.issuer,
  redirectUri: `${window.location.origin}/auth/callback`,
  postLogoutRedirectUri: window.location.origin,
  clientId: 'angular',
  responseType: 'code',
  scope: 'openid profile email roles blackeneddeath.api offline_access',
  useSilentRefresh: false,
  sessionChecksEnabled: false,
  showDebugInformation: false,
  strictDiscoveryDocumentValidation: false,
  timeoutFactor: 0.75,
  oidc: true,

  // Hardcode endpoints to skip discovery document request on startup
  loginUrl: `${environment.issuer}/connect/authorize`,
  tokenEndpoint: `${environment.issuer}/connect/token`,
  userinfoEndpoint: `${environment.issuer}/connect/userinfo`,
  logoutUrl: `${environment.issuer}/connect/endsession`,
  skipIssuerCheck: true,
};