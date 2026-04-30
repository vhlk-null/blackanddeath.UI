import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface AppConfig {
  apiUrl: string;
  usercontentUrl: string;
  issuer: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config!: AppConfig;

  constructor(private http: HttpClient) {}

  async load(): Promise<void> {
    this.config = await firstValueFrom(
      this.http.get<AppConfig>('/assets/config.json')
    );
  }

  get apiUrl(): string { return this.config.apiUrl; }
  get usercontentUrl(): string { return this.config.usercontentUrl; }
  get issuer(): string { return this.config.issuer; }
}
