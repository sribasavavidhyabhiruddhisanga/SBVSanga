import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Row shape sent to / received from the upcoming-events API. */
export interface UpcomingEventRecord {
  eventId: string;
  title: string;
  date: string;
  location: string;
  description: string;
}

function normalizeEvent(record: Partial<UpcomingEventRecord>): UpcomingEventRecord {
  return {
    eventId: record.eventId ?? '',
    title: record.title ?? '',
    date: record.date ?? '',
    location: record.location ?? '',
    description: record.description ?? '',
  };
}

@Injectable({ providedIn: 'root' })
export class UpcomingEventsService {
  private readonly resourceUrl = `${API_BASE_URL}/data/upcoming_events.json`;

  constructor(private http: HttpClient) {}

  getEvents(): Observable<UpcomingEventRecord[]> {
    return this.http.get<UpcomingEventRecord[] | UpcomingEventRecord | null>(this.resourceUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];
        return records.map(normalizeEvent);
      }),
    );
  }

  /**
   * Posts the FULL event list (existing + new), not just the new record — see
   * MemberRegisteredService for why: the live `/data/*.json` endpoints have been observed
   * writing the POST body directly as the file's entire contents.
   */
  createEvent(events: UpcomingEventRecord[]): Observable<UpcomingEventRecord[]> {
    return this.http.post<UpcomingEventRecord[]>(this.resourceUrl, events);
  }

  /** Next sequential "EVTxxx" id, derived from the highest numeric suffix already on record. */
  nextEventId(existing: UpcomingEventRecord[]): string {
    const highest = existing.reduce((max, record) => {
      const match = /^EVT(\d+)$/.exec(record.eventId ?? '');
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `EVT${String(highest + 1).padStart(3, '0')}`;
  }

  /**
   * The live `/data/*.json` endpoint only implements GET/POST/PUT — there's no server-side
   * delete-by-id, so this drops the record locally and POSTs the full remaining list back,
   * same as every other mutation here.
   */
  deleteEvent(eventId: string): Observable<UpcomingEventRecord[]> {
    return this.getEvents().pipe(
      switchMap((existing) => this.createEvent(existing.filter((event) => event.eventId !== eventId))),
    );
  }
}
