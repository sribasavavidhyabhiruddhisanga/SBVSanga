import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

export interface ScholarshipDocLink {
  uploadUrl: string;
  key: string;
}

/** Row shape sent to / received from the scholarship-received API. Field names/casing match the live payload as specified. */
export interface ScholarshipApplication {
  id: string;
  name: string;
  emailId: string;
  upiLinked_Phone: string;
  address: string;
  parentsName_occuptation: string;
  'institution Name': string;
  currentEducation: string;
  percentage_marks: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  referredBy: string;
  availedScholarship: string;
  score: string;
  status: 'Pending' | 'Accept' | 'Reject';
  timeStamp: string;
  docLink: ScholarshipDocLink | Record<string, never>;
}

function normalizeApplication(record: Partial<ScholarshipApplication>): ScholarshipApplication {
  return {
    id: record.id ?? '',
    name: record.name ?? '',
    emailId: record.emailId ?? '',
    upiLinked_Phone: record.upiLinked_Phone ?? '',
    address: record.address ?? '',
    parentsName_occuptation: record.parentsName_occuptation ?? '',
    'institution Name': record['institution Name'] ?? '',
    currentEducation: record.currentEducation ?? '',
    percentage_marks: record.percentage_marks ?? '',
    accountHolderName: record.accountHolderName ?? '',
    bankName: record.bankName ?? '',
    accountNumber: record.accountNumber ?? '',
    ifscCode: record.ifscCode ?? '',
    referredBy: record.referredBy ?? '',
    availedScholarship: record.availedScholarship ?? '',
    score: record.score ?? '',
    status: record.status ?? 'Pending',
    timeStamp: record.timeStamp ?? '',
    docLink: record.docLink ?? {},
  };
}

@Injectable({ providedIn: 'root' })
export class ScholarshipReceivedService {
  private readonly resourceUrl = `${API_BASE_URL}/data/scholarship_received.json`;

  constructor(private http: HttpClient) {}

  getApplications(): Observable<ScholarshipApplication[]> {
    return this.http.get<ScholarshipApplication[] | ScholarshipApplication | null>(this.resourceUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];
        return records.map(normalizeApplication);
      }),
    );
  }

  /**
   * Posts the FULL roster (existing + new), not just the new record — the live `/data/*.json`
   * endpoints overwrite the whole file with the POST/PUT body rather than appending.
   */
  createApplication(applications: ScholarshipApplication[]): Observable<ScholarshipApplication[]> {
    return this.http.post<ScholarshipApplication[]>(this.resourceUrl, applications);
  }

  /** Writes back the FULL roster after a local mutation (e.g. a status change). */
  updateApplications(applications: ScholarshipApplication[]): Observable<ScholarshipApplication[]> {
    return this.http.put<ScholarshipApplication[]>(this.resourceUrl, applications);
  }

  /** Next sequential "SCHxxx" id, derived from the highest numeric suffix already on record. */
  nextApplicationId(existing: ScholarshipApplication[]): string {
    const highest = existing.reduce((max, record) => {
      const match = /^SCH(\d+)$/.exec(record.id ?? '');
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `SCH${String(highest + 1).padStart(3, '0')}`;
  }
}
