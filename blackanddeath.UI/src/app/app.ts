import { Component, inject, OnInit, effect } from '@angular/core';
import { Header } from "./core/components/header/header";
import { Footer } from "./core/components/footer/footer";
import { RouterOutlet } from '@angular/router';
import { Toast } from './shared/components/toast/toast';
import { Loader } from './shared/components/loader/loader';
import { AgeGate } from './shared/components/age-gate/age-gate';
import { PreviewGate } from './shared/components/preview-gate/preview-gate';
import { AuthService } from './core/auth/auth.service';
import { SubscriptionService } from './features/services/subscription.service';

@Component({
  selector: 'app-root',
  imports: [Header, Footer, RouterOutlet, Toast, Loader, AgeGate, PreviewGate],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);

  constructor() {
    effect(() => {
      if (this.auth.userId()) {
        this.subscriptionService.preload().subscribe();
      }
    });
  }
}
