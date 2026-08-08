import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Row shape returned by the remote member list API and consumed by the reusable data table. */
export interface MemberRecord {
  memberId: string;
  name: string;
  address: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly apiUrl = `${API_BASE_URL}/data/members_list.json`;

  constructor(private http: HttpClient) {}

  getMembers(): Observable<MemberRecord[]> {
    return this.http.get<MemberRecord[] | MemberRecord | null>(this.apiUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];

        return records.map((record) => ({
          memberId: record.memberId ?? '',
          name: record.name ?? '',
          address: record.address ?? '',
          status: record.status ?? '',
        }));
      }),
    );
  }

  /**
   * The live `/data/*.json` endpoint has no partial-update verb — same as UpcomingEventsService,
   * this rewrites the full file with one record's status changed.
   */
  updateMemberStatus(memberId: string, status: string): Observable<MemberRecord[]> {
    return this.getMembers().pipe(
      switchMap((existing) => {
        const updated = existing.map((member) => (member.memberId === memberId ? { ...member, status } : member));
        return this.http.put<MemberRecord[]>(this.apiUrl, updated);
      }),
    );
  }
}
