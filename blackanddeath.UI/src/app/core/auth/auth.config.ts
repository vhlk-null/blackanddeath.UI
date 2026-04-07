import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://localhost:5021',
  redirectUri: 'http://localhost:4200/auth/callback',
  postLogoutRedirectUri: 'http://localhost:4200',
  clientId: 'angular',
  responseType: 'code',
  scope: 'openid profile libraryAPI offline_access',
  useSilentRefresh: false,
  showDebugInformation: true,
};
