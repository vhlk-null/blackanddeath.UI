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
  resourceType?: string;
  resourceId: string;
  resourceSlug?: string | null;
  resourceName?: string;
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
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
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
      let delay = 3000;
      while (!signal.aborted) {
        try {
          delay = 3000;
          for await (const raw of streamSse<any>(
            NotificationEndpoints.STREAM,
            this.auth.getAccessToken(),
            signal,
          )) {
            const type: string = raw.Type ?? raw.type ?? '';
            const resourceType = raw.ResourceType ?? raw.resourceType ?? (type.startsWith('album') ? 'album' : type.startsWith('band') ? 'band' : '');
            const notification: AppNotification = {
              id: raw.Id ?? raw.id,
              userId: raw.UserId ?? raw.userId,
              title: raw.Title ?? raw.title,
              message: raw.Message ?? raw.message,
              type,
              resourceType,
              resourceId: raw.ResourceId ?? raw.resourceId,
              resourceSlug: raw.ResourceSlug ?? raw.resourceSlug ?? null,
              resourceName: raw.ResourceName ?? raw.resourceName,
              isRead: raw.IsRead ?? raw.isRead ?? false,
              createdAt: raw.CreatedAt ?? raw.createdAt,
            };
            this.zone.run(() => {
              this.notifications.update(list => [notification, ...list]);
              this.unreadCount.update(c => c + 1);
            });
          }
        } catch (err) {
          if (signal.aborted) break;
          console.warn(`[SSE] disconnected, reconnecting in ${delay / 1000}s...`, err);
        }
        if (!signal.aborted) {
          await new Promise(r => setTimeout(r, delay));
          delay = Math.min(delay * 2, 60_000);
          console.log('[SSE] reconnecting...');
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
