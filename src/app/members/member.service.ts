import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

/** Row shape returned by the remote member list API and consumed by the reusable data table. */
export interface MemberRecord {
  memberId: string;
  name: string;
  address: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class MemberService {
  private readonly apiUrl =
    'https://raw.githubusercontent.com/sribasavavidhyabhiruddhisanga/API/refs/heads/main/member_list.json';

  constructor(private http: HttpClient) {}

  getMembers(): Observable<MemberRecord[]> {
    return this.http.get<MemberRecord[]>(this.apiUrl).pipe(
      map((records) =>
        records.map((record) => ({
          memberId: record.memberId ?? '',
          name: record.name ?? '',
          address: record.address ?? '',
          status: record.status ?? '',
        })),
      ),
    );
  }
}
