import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Raw shape of a record in the remote scholarship applicants API. */
export interface ScholarshipApiRecord {
  'Email address': string;
  "STUDENT'S FULL NAME": string;
  'FATHER/MOTHER NAME & OCCUPATION': string;
  'PERMANENT POSTAL ADDRESS': string;
  'PHONE PE / GPAY MOBILE NUMBER (Linked to Bank Account )': string | number;
  [key: string]: unknown;
}

/** Row shape consumed by the reusable data table. */
export interface ScholarshipRow {
  studentName: string;
  email: string;
  parentAndOccupation: string;
  address: string;
  phoneNumber: string;
}

@Injectable({ providedIn: 'root' })
export class ScholarshipService {
  private readonly apiUrl = `${API_BASE_URL}/data/scholarship_list.json`;

  constructor(private http: HttpClient) {}

  getScholarships(): Observable<ScholarshipRow[]> {
    return this.http.get<ScholarshipApiRecord[] | ScholarshipApiRecord | null>(this.apiUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];
        return records.map((record) => this.toRow(record));
      }),
    );
  }

  private toRow(record: ScholarshipApiRecord): ScholarshipRow {
    return {
      studentName: record["STUDENT'S FULL NAME"] ?? '',
      email: record['Email address'] ?? '',
      parentAndOccupation: record['FATHER/MOTHER NAME & OCCUPATION'] ?? '',
      address: record['PERMANENT POSTAL ADDRESS'] ?? '',
      phoneNumber: String(record['PHONE PE / GPAY MOBILE NUMBER (Linked to Bank Account )'] ?? ''),
    };
  }
}
