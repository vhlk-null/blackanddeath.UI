import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { LoginModal } from '../../../shared/components/login-modal/login-modal';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, LoginModal],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  readonly theme = inject(ThemeService);
  readonly menuOpen = signal(false);
  readonly loginOpen = signal(false);
}
