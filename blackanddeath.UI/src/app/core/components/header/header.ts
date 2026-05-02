import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchFilterPanel } from '../../../shared/components/search-filter-panel/search-filter-panel';
import { GlobalSearch } from '../../../shared/components/global-search/global-search';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, SearchFilterPanel, GlobalSearch],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);

  readonly menuOpen = signal(false);
  readonly filterOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly hidden = signal(false);
  readonly searchOpen = signal(false);
  readonly scrolled = signal(false);

  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    const currentY = window.scrollY;
    this.scrolled.set(currentY > 16);
    this.lastScrollY = currentY;
  }
}
