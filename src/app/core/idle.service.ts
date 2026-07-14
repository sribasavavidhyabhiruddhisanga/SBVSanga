import { Injectable, NgZone } from '@angular/core';
import { Subject, Subscription, fromEvent, merge, startWith, switchMap, timer } from 'rxjs';

const IDLE_TIMEOUT_MS = 2 * 60 * 1000;
const ACTIVITY_EVENTS = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'] as const;

/** Tracks global user activity and reports back after a period of inactivity. */
@Injectable({ providedIn: 'root' })
export class IdleService {
  private readonly idleSubject = new Subject<void>();
  private subscription: Subscription | null = null;

  readonly idle$ = this.idleSubject.asObservable();

  constructor(private zone: NgZone) {}

  start(): void {
    if (this.subscription) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      const activity$ = merge(
        ...ACTIVITY_EVENTS.map((eventName) => fromEvent(document, eventName)),
      );

      this.subscription = activity$
        .pipe(
          startWith(null),
          switchMap(() => timer(IDLE_TIMEOUT_MS)),
        )
        .subscribe(() => this.zone.run(() => this.idleSubject.next()));
    });
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}
