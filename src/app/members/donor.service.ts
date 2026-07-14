import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

/** Row shape returned by the remote donor list API and consumed by the reusable data table. */
export interface DonorRecord {
  donarId: string;
  name: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class DonorService {
  private readonly apiUrl =
    'https://raw.githubusercontent.com/sribasavavidhyabhiruddhisanga/API/refs/heads/main/donor_list.json';

  constructor(private http: HttpClient) {}

  getDonors(): Observable<DonorRecord[]> {
    return this.http.get<DonorRecord[]>(this.apiUrl).pipe(
      map((records) =>
        records.map((record) => ({
          donarId: record.donarId ?? '',
          name: record.name ?? '',
          address: record.address ?? '',
        })),
      ),
    );
  }
}
