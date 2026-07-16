import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';
import { toIsoDate } from '../core/date.util';

/** Row shape sent to / received from the donation-received API. */
export interface DonationRecord {
  name: string;
  amount: number;
  address: string;
  notes: string;
  paymentMode: string;
  donationFor: string;
  date: string;
  paymentSuccessful: boolean;
}

export interface DonationState {
  donations: DonationRecord[];
  /** The server's own clock (from the response's `Date` header), formatted YYYY-MM-DD — never the client's `new Date()`. */
  serverDate: string;
}

function normalizeDonation(record: Partial<DonationRecord>): DonationRecord {
  return {
    name: record.name ?? '',
    amount: Number(record.amount) || 0,
    address: record.address ?? '',
    notes: record.notes ?? '',
    paymentMode: record.paymentMode ?? '',
    donationFor: record.donationFor ?? '',
    date: record.date ?? '',
    paymentSuccessful: record.paymentSuccessful ?? false,
  };
}

@Injectable({ providedIn: 'root' })
export class DonationService {
  private readonly resourceUrl = `${API_BASE_URL}/data/donation_received.json`;

  constructor(private http: HttpClient) {}

  /** Plain roster fetch for the read-only Donation List admin view. */
  getDonations(): Observable<DonationRecord[]> {
    return this.http.get<DonationRecord[] | DonationRecord | null>(this.resourceUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];
        return records.map(normalizeDonation);
      }),
    );
  }

  /**
   * Fetches the current donation roster together with the server's own clock in a single
   * round trip, read from the HTTP response's `Date` header — so a donation's `date` field
   * never has to be sourced from the client's local `new Date()`. Falls back to the client
   * clock only if the API doesn't expose that header for cross-origin reads (would need
   * `Access-Control-Expose-Headers: Date` on the API Gateway response).
   */
  fetchState(): Observable<DonationState> {
    return this.http
      .get<DonationRecord[] | DonationRecord | null>(this.resourceUrl, { observe: 'response' })
      .pipe(
        map((response) => {
          const body = response.body;
          const records = Array.isArray(body) ? body : body ? [body] : [];
          const headerDate = response.headers.get('date');

          return {
            donations: records.map(normalizeDonation),
            serverDate: toIsoDate(headerDate ? new Date(headerDate) : new Date()),
          };
        }),
      );
  }

  /**
   * Posts the FULL donation roster (existing + new), not just the new record. The live
   * `/data/*.json` endpoints have been observed writing the POST body directly as the
   * file's entire contents instead of appending to what's already stored — sending only
   * the new record would silently erase every prior donation.
   */
  createDonation(donations: DonationRecord[]): Observable<DonationRecord[]> {
    return this.http.post<DonationRecord[]>(this.resourceUrl, donations);
  }
}
