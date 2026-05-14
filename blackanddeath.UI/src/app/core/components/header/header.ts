import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GlobalSearch } from '../../../shared/components/global-search/global-search';
import { AuthService } from '../../auth/auth.service';
import { NotificationService } from '../../../features/services/notification.service';
import { SubscriptionService } from '../../../features/services/subscription.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, GlobalSearch, DatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly auth = inject(AuthService);
  readonly notifications = inject(NotificationService);
  private readonly subscriptions = inject(SubscriptionService);
  readonly router = inject(Router);

  readonly userMenuOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly hidden = signal(false);
  readonly searchOpen = signal(false);
  readonly scrolled = signal(false);

  readonly isMobile = () => window.innerWidth <= 896;

  onNotifClick(n: import('../../../features/services/notification.service').AppNotification): void {
    const resourceType = n.resourceType ?? (n.type.startsWith('album') ? 'album' : 'band');
    const base = resourceType === 'album' ? '/albums' : '/bands';
    const slug = n.resourceSlug
      || this.subscriptions.all().find(s => s.resourceType === resourceType && s.resourceId === n.resourceId)?.resourceSlug
      || null;
    if (slug) {
      this.router.navigate([base, slug]);
      this.notifOpen.set(false);
    }
  }

  onUserBtnClick(): void {
    if (this.isMobile()) {
      this.auth.isAuthenticated() ? this.router.navigate(['/profile']) : this.auth.login();
    } else {
      this.userMenuOpen.set(true);
    }
  }

  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    const currentY = window.scrollY;
    this.scrolled.set(currentY > 16);
    this.lastScrollY = currentY;
  }
}
