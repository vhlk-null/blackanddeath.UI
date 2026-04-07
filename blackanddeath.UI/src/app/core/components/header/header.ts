import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
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
  readonly menuOpen = signal(false);
  readonly filterOpen = signal(false);
  readonly userMenuOpen = signal(false);
}
