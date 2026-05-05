import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from './intrefaces/http';
import { SubscriptionEndpoints } from '../../shared/constants/endpoints';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private http = inject(BaseHttpService);

  subscribe(resourceType: string, resourceId: string): Observable<void> {
    return this.http.post<void>(SubscriptionEndpoints.SUBSCRIBE(resourceType, resourceId), {});
  }

  unsubscribe(resourceType: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(SubscriptionEndpoints.UNSUBSCRIBE(resourceType, resourceId));
  }

  isSubscribed(resourceType: string, resourceId: string): Observable<boolean> {
    return this.http.get<boolean>(SubscriptionEndpoints.CHECK(resourceType, resourceId));
  }
}
