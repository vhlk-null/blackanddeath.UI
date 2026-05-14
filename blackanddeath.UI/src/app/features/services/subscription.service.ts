import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { SubscriptionEndpoints } from '../../shared/constants/endpoints';

export interface SubscriptionDto {
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  resourceSlug?: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(BaseHttpService);

  private cache = new Set<string>();
  private cacheLoaded = false;
  readonly all = signal<SubscriptionDto[]>([]);

  private key(resourceType: string, resourceId: string): string {
    return `${resourceType}:${resourceId}`;
  }

  preload(): Observable<SubscriptionDto[]> {
    return this.http.get<SubscriptionDto[]>(SubscriptionEndpoints.GET_ALL).pipe(
      tap(subs => {
        this.cache.clear();
        subs.forEach(s => this.cache.add(this.key(s.resourceType, s.resourceId)));
        this.all.set(subs);
        this.cacheLoaded = true;
      })
    );
  }

  subscribe(resourceType: string, resourceId: string, resourceName?: string, resourceSlug?: string): Observable<void> {
    return this.http.post<void>(SubscriptionEndpoints.SUBSCRIBE(resourceType, resourceId), { resourceName, resourceSlug }).pipe(
      tap(() => {
        this.cache.add(this.key(resourceType, resourceId));
        this.all.update(subs => [...subs, { resourceType, resourceId, resourceName, resourceSlug }]);
      })
    );
  }

  unsubscribe(resourceType: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(SubscriptionEndpoints.UNSUBSCRIBE(resourceType, resourceId)).pipe(
      tap(() => {
        this.cache.delete(this.key(resourceType, resourceId));
        this.all.update(subs => subs.filter(s => !(s.resourceType === resourceType && s.resourceId === resourceId)));
      })
    );
  }

  isSubscribedSync(resourceType: string, resourceId: string): boolean {
    return this.cache.has(this.key(resourceType, resourceId));
  }

  isCacheLoaded(): boolean {
    return this.cacheLoaded;
  }

  getAll(): Observable<SubscriptionDto[]> {
    return this.http.get<SubscriptionDto[]>(SubscriptionEndpoints.GET_ALL);
  }
}
