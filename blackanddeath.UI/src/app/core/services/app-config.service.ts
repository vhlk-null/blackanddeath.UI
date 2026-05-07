import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AppConfig {
  apiUrl: string;
  usercontentUrl: string;
  notificationsUrl: string;
  issuer: string;
  previewPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config!: AppConfig;
  private http: HttpClient;

  constructor(handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    );
  }

  get apiUrl(): string { return this.config.apiUrl; }
  get usercontentUrl(): string { return this.config.usercontentUrl; }
  get notificationsUrl(): string { return this.config.notificationsUrl; }
  get issuer(): string { return this.config.issuer; }
  get previewPassword(): string { return this.config.previewPassword ?? ''; }
}
