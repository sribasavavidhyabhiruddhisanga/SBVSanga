import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';

interface UpcomingEvent {
  title: string;
  date: string;
  dateValue?: Date;
  location: string;
  description?: string;
  colorFrom: string;
  colorTo: string;
}

const GRADIENT_PALETTE: ReadonlyArray<readonly [string, string]> = [
  ['from-orange-400', 'to-amber-600'],
  ['from-amber-400', 'to-orange-600'],
  ['from-stone-500', 'to-orange-600'],
  ['from-orange-500', 'to-red-600'],
  ['from-amber-500', 'to-stone-700'],
];

const MS_PER_DAY = 86_400_000;

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './upcoming-events.component.html',
})
export class UpcomingEventsComponent {
  submitting = false;

  readonly minDate = this.toIsoDate(new Date());

  events: UpcomingEvent[] = [
    { title: 'Annual General Meeting', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-orange-400', colorTo: 'to-amber-600' },
    { title: 'Scholarship Distribution', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-amber-400', colorTo: 'to-orange-600' },
    { title: 'Health Check-up Camp', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-stone-500', colorTo: 'to-orange-600' },
  ];

  form: { title: string; date: string; location: string; description: string } = {
    title: '',
    date: '',
    location: '',
    description: '',
  };

  constructor(private toastService: ToastService) {}

  createEvent(): void {
    if (!this.form.title || !this.form.date || !this.form.location || this.form.date < this.minDate) {
      return;
    }

    this.submitting = true;
    const [colorFrom, colorTo] = GRADIENT_PALETTE[this.events.length % GRADIENT_PALETTE.length];
    const dateValue = this.parseDateInput(this.form.date);

    setTimeout(() => {
      this.events = [
        {
          title: this.form.title,
          date: dateValue.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          dateValue,
          location: this.form.location,
          description: this.form.description || undefined,
          colorFrom,
          colorTo,
        },
        ...this.events,
      ];

      this.submitting = false;
      this.form = { title: '', date: '', location: '', description: '' };
      this.toastService.show('Upcoming event created.', 'success');
    }, 500);
  }

  /** Countdown badge shown on each event card, e.g. "Today", "Tomorrow", "12 days left". */
  getCountdownLabel(event: UpcomingEvent): string {
    if (!event.dateValue) {
      return 'Date TBD';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(event.dateValue);
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

  private parseDateInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
