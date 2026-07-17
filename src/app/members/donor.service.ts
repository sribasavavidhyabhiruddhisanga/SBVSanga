import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Row shape returned by the remote donor list API and consumed by the reusable data table. */
export interface DonorRecord {
  donarId: string;
  name: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class DonorService {
  private readonly apiUrl = `${API_BASE_URL}/data/donors_list.json`;

  constructor(private http: HttpClient) {}

  getDonors(): Observable<DonorRecord[]> {
    return this.http.get<DonorRecord[] | DonorRecord | null>(this.apiUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];

        return records.map((record) => ({
          donarId: record.donarId ?? '',
          name: record.name ?? '',
          address: record.address ?? '',
        }));
      }),
    );
  }
}
