import { inject, Injectable, NgZone, OnDestroy, signal } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { BaseHttpService } from './intrefaces/http';
import { NotificationEndpoints } from '../../shared/constants/endpoints';
import { streamSse } from '../../shared/utils/sse';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  resourceId: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private readonly http = inject(BaseHttpService);
  private readonly auth = inject(AuthService);
  private readonly zone = inject(NgZone);

  readonly notifications = signal<AppNotification[]>([]);
  readonly unreadCount = signal(0);

  private abortController: AbortController | null = null;

  async init(): Promise<void> {
    const existing = await firstValueFrom(this.http.get<AppNotification[]>(NotificationEndpoints.GET_ALL));
    if (existing) {
      this.notifications.set(existing);
      this.unreadCount.set(existing.filter((n: AppNotification) => !n.isRead).length);
    }
    this.connectStream();
  }

  private connectStream(): void {
    this.abortController?.abort();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    (async () => {
      console.log('[SSE] connecting...');
      while (!signal.aborted) {
        try {
          for await (const notification of streamSse<AppNotification>(
            NotificationEndpoints.STREAM,
            this.auth.getAccessToken(),
            signal,
          )) {
            console.log('[SSE] received:', notification);
            await this.zone.run(async () => {
              this.notifications.update(list => [notification, ...list]);
              this.unreadCount.update(c => c + 1);
            });
          }
          console.log('[SSE] stream ended');
        } catch (err) {
          if (signal.aborted) break;
          console.warn('[SSE] disconnected, reconnecting in 3s...', err);
        }
        if (!signal.aborted) {
          await new Promise(r => setTimeout(r, 3000));
          console.log('[SSE] reconnecting...');
          const fresh = await firstValueFrom(this.http.get<AppNotification[]>(NotificationEndpoints.GET_ALL)).catch(() => null);
          if (fresh) this.zone.run(() => {
            this.notifications.set(fresh);
            this.unreadCount.set(fresh.filter((n: AppNotification) => !n.isRead).length);
          });
        }
      }
      console.log('[SSE] connection closed');
    })();
  }

  markRead(id: string): Observable<void> {
    return new Observable(observer => {
      this.http.patch<void>(NotificationEndpoints.MARK_READ(id), {}).subscribe({
        next: () => {
          this.notifications.update(list =>
            list.map(n => n.id === id ? { ...n, isRead: true } : n)
          );
          this.unreadCount.update(c => Math.max(0, c - 1));
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err),
      });
    });
  }

  markAllRead(): Observable<void> {
    return new Observable(observer => {
      this.http.patch<void>(NotificationEndpoints.MARK_ALL_READ, {}).subscribe({
        next: () => {
          this.notifications.update(list => list.map(n => ({ ...n, IsRead: true })));
          this.unreadCount.set(0);
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err),
      });
    });
  }

  ngOnDestroy(): void {
    this.abortController?.abort();
  }
}
