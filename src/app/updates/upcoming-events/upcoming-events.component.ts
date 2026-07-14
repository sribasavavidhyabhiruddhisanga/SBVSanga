import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface UpcomingEvent {
  title: string;
  date: string;
  location: string;
  colorFrom: string;
  colorTo: string;
}

@Component({
  selector: 'app-upcoming-events',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './upcoming-events.component.html',
})
export class UpcomingEventsComponent {
  readonly events: UpcomingEvent[] = [
    { title: 'Annual General Meeting', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-orange-400', colorTo: 'to-amber-600' },
    { title: 'Scholarship Distribution', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-amber-400', colorTo: 'to-orange-600' },
    { title: 'Health Check-up Camp', date: 'To be announced', location: 'Community Hall', colorFrom: 'from-stone-500', colorTo: 'to-orange-600' },
  ];
}
