import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Row shape returned by the member-registered API and consumed by the reusable data table. */
export interface MemberRegisteredRecord {
  memberId: string;
  name: string;
  emailId: string;
  address: string;
  phone: string;
  referredBy: string;
  status: string;
  date: string;
}

/** Fields captured by the Add Member form before the service stamps memberId/status on. */
export type NewMemberRegistered = Omit<MemberRegisteredRecord, 'memberId' | 'status'>;

@Injectable({ providedIn: 'root' })
export class MemberRegisteredService {
  private readonly resourceUrl = `${API_BASE_URL}/data/member_registered.json`;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<MemberRegisteredRecord[]> {
    return this.http.get<MemberRegisteredRecord[] | MemberRegisteredRecord>(this.resourceUrl).pipe(
      map((response) => {
        // The backend has been observed replacing the whole file with just the most
        // recently posted record (a bare object, not wrapped in an array) instead of
        // appending to the existing array — normalize so the table doesn't crash on it.
        const records = Array.isArray(response) ? response : response ? [response] : [];

        return records.map((record) => ({
          memberId: record.memberId ?? '',
          name: record.name ?? '',
          emailId: record.emailId ?? '',
          address: record.address ?? '',
          phone: record.phone ?? '',
          referredBy: record.referredBy ?? '',
          status: record.status ?? '',
          date: record.date ?? '',
        }));
      }),
    );
  }

  /**
   * Posts the FULL roster (existing records + the new one), not just the new record.
   * The live endpoint has been observed writing the POST body directly as the file's
   * entire contents instead of appending to what's already stored — sending only the
   * new record silently erases every prior member. Sending the complete array keeps
   * the file correct even against that overwrite behavior.
   */
  createMember(members: MemberRegisteredRecord[]): Observable<MemberRegisteredRecord[]> {
    return this.http.post<MemberRegisteredRecord[]>(this.resourceUrl, members);
  }

  /** Next sequential "BVSxxx" id, derived from the highest numeric suffix already on record. */
  nextMemberId(existing: MemberRegisteredRecord[]): string {
    const highest = existing.reduce((max, record) => {
      const match = /^BVS(\d+)$/.exec(record.memberId ?? '');
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `BVS${String(highest + 1).padStart(3, '0')}`;
  }
}
