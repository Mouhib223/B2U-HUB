import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, interval } from 'rxjs';
import { startWith, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AutoRefreshService {
  private refreshSubscriptions = new Map<string, Subscription>();
  private refreshStatus$ = new BehaviorSubject<{ [key: string]: boolean }>({});

  readonly REFRESH_INTERVAL = 60000;

  startAutoRefresh<T>(
    componentId: string,
    refreshFunction: () => Observable<T>,
    intervalMs: number = this.REFRESH_INTERVAL
  ): Observable<T> {
    this.stopAutoRefresh(componentId);
    this.updateRefreshStatus(componentId, true);

    return interval(intervalMs).pipe(
      startWith(0),
      switchMap(() => refreshFunction()),
      tap(() => this.updateRefreshStatus(componentId, true))
    );
  }

  stopAutoRefresh(componentId: string): void {
    const subscription = this.refreshSubscriptions.get(componentId);
    if (subscription) {
      subscription.unsubscribe();
      this.refreshSubscriptions.delete(componentId);
    }
    this.updateRefreshStatus(componentId, false);
  }

  stopAllAutoRefresh(): void {
    this.refreshSubscriptions.forEach((subscription, componentId) => {
      subscription.unsubscribe();
      this.updateRefreshStatus(componentId, false);
    });
    this.refreshSubscriptions.clear();
  }

  isAutoRefreshActive(componentId: string): boolean {
    return this.refreshStatus$.value[componentId] || false;
  }

  getRefreshStatus(): Observable<{ [key: string]: boolean }> {
    return this.refreshStatus$.asObservable();
  }

  forceRefresh(componentId: string): void {
    this.updateRefreshStatus(componentId, true);
  }

  private updateRefreshStatus(componentId: string, active: boolean): void {
    const currentStatus = this.refreshStatus$.value;
    this.refreshStatus$.next({
      ...currentStatus,
      [componentId]: active
    });
  }
}
