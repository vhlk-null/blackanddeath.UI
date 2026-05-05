import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideAppInitializer, inject } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { loaderInterceptor } from './core/interceptors/loader.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { AppConfigService } from './core/services/app-config.service';
import { initEndpoints } from './shared/constants/endpoints';
import { NotificationService } from './features/services/notification.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    provideHttpClient(withInterceptors([authInterceptor, loaderInterceptor])),
    provideOAuthClient(),
    provideAppInitializer(async () => {
      const config = inject(AppConfigService);
      const auth = inject(AuthService);
      const notifications = inject(NotificationService);
      await config.load();
      initEndpoints(config);
      await auth.init();
      if (auth.isAuthenticated()) await notifications.init();
    }),
  ]
};
