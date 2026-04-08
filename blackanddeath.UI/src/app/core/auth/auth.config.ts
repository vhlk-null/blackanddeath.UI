import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://localhost:6021',
  redirectUri: 'http://localhost:4200/auth/callback',
  postLogoutRedirectUri: 'http://localhost:4200',
  clientId: 'angular',
  responseType: 'code',
  scope: 'openid profile email roles libraryAPI offline_access',
  useSilentRefresh: true,
  showDebugInformation: true,
};
