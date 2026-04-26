import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { SearchFilterPanel } from '../../../shared/components/search-filter-panel/search-filter-panel';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, SearchFilterPanel],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly filterOpen = signal(false);
  readonly userMenuOpen = signal(false);
  readonly hidden = signal(false);
  readonly searchQuery = signal('');

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (!q) return;
    this.router.navigate(['/albums'], { queryParams: { name: q } });
    this.searchQuery.set('');
  }

  private lastScrollY = 0;

  @HostListener('window:scroll')
  onScroll(): void {
    const currentY = window.scrollY;
    if (currentY > this.lastScrollY && currentY > 64) {
      this.hidden.set(true);
      this.menuOpen.set(false);
      this.userMenuOpen.set(false);
    } else {
      this.hidden.set(false);
    }
    this.lastScrollY = currentY;
  }
}
