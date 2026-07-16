import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { formatDisplayDate, parseIsoDate, toIsoDate } from '../../core/date.util';
import { UpcomingEventRecord, UpcomingEventsService } from '../upcoming-events.service';

interface UpcomingEventsViewModel {
  loading: boolean;
  error: boolean;
  events: UpcomingEventRecord[];
}

const MS_PER_DAY = 86_400_000;

const GRADIENT_PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['from-orange-400', 'to-amber-600'],
  ['from-amber-400', 'to-orange-600'],
  ['from-stone-500', 'to-orange-600'],
  ['from-orange-500', 'to-red-600'],
  ['from-amber-500', 'to-stone-700'],
];

function sortByDate(events: UpcomingEventRecord[]): UpcomingEventRecord[] {
  return [...events].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
}

/**
 * This app runs zoneless, so the roster loaded on init is built from a single `vm$`
 * consumed via the `async` pipe rather than a bare `.subscribe()` mutating plain fields.
 * `refresh$` re-triggers the GET on `ngOnInit` and again after a successful create so the
 * grid reflects what the server actually persisted rather than an optimistic local push.
 */
@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './upcoming-events.component.html',
})
export class UpcomingEventsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly eventsService = inject(UpcomingEventsService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  submitting = false;
  readonly minDate = toIsoDate(new Date());

  readonly form = this.fb.group({
    title: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', Validators.required],
  });

  private readonly events$: Observable<UpcomingEventRecord[] | 'error'> = this.refresh$.pipe(
    switchMap(() =>
      this.eventsService.getEvents().pipe(
        catchError((error) => {
          this.toastService.show(
            extractApiErrorMessage(error, "Couldn't load upcoming events right now."),
            'error',
          );
          return of<'error'>('error');
        }),
      ),
    ),
  );

  readonly vm$: Observable<UpcomingEventsViewModel> = this.events$.pipe(
    startWith(undefined),
    map((events): UpcomingEventsViewModel => {
      if (events === undefined) {
        return { loading: true, error: false, events: [] };
      }
      if (events === 'error') {
        return { loading: false, error: true, events: [] };
      }

      return { loading: false, error: false, events: sortByDate(events) };
    }),
  );

  ngOnInit(): void {
    this.refresh$.next();
  }

  createEvent(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue();
    const payload: UpcomingEventRecord = {
      title: value.title ?? '',
      date: value.date ?? '',
      location: value.location ?? '',
      description: value.description ?? '',
    };

    this.eventsService
      .getEvents()
      .pipe(switchMap((existing) => this.eventsService.createEvent([...existing, payload])))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.form.reset({ title: '', date: '', location: '', description: '' });
          this.toastService.show('Upcoming event created.', 'success');
          this.refresh$.next();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.submitting = false;
          this.toastService.show(
            extractApiErrorMessage(error, 'Could not add the event. Please try again.'),
            'error',
          );
          this.cdr.markForCheck();
        },
      });
  }

  getGradient(index: number): readonly [string, string] {
    return GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
  }

  formatDate(dateValue: string): string {
    return dateValue ? formatDisplayDate(dateValue) : 'Date TBD';
  }

  /** Countdown badge shown on each event card, e.g. "Today", "Tomorrow", "12 days left". */
  getCountdownLabel(dateValue: string): string {
    if (!dateValue) {
      return 'Date TBD';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseIsoDate(dateValue);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);

    if (diffDays < 0) {
      return 'Past event';
    }
    if (diffDays === 0) {
      return 'Today';
    }
    if (diffDays === 1) {
      return 'Tomorrow';
    }
    if (diffDays <= 7) {
      return 'This Week';
    }

    const monthDiff =
      (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());

    if (monthDiff === 0) {
      return 'This Month';
    }
    if (monthDiff === 1) {
      return 'Next Month';
    }
    return `${diffDays} days left`;
  }
}
