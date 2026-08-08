import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** A whitelist entry as returned by the admin-only user-manage API. */
export interface ManagedUser {
  id: string;
  name: string;
  userName: string;
  emailId: string;
  userType: string;
}

export interface NewUserPayload {
  name: string;
  userName: string;
  emailId: string;
  userType: string;
}

/**
 * Every call here requires a fresh Google identity token — the Lambda re-verifies it with
 * Google and checks the resulting email is a current Admin before allowing any read or write,
 * since this whitelist controls who gets Admin access to the whole app.
 */
@Injectable({ providedIn: 'root' })
export class ManageUsersService {
  private readonly resourceUrl = `${API_BASE_URL}/admin/users`;

  constructor(private http: HttpClient) {}

  listUsers(idToken: string): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.resourceUrl, { params: { idToken } });
  }

  addUser(idToken: string, payload: NewUserPayload): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.resourceUrl, payload, { params: { idToken } });
  }

  removeUser(idToken: string, id: string): Observable<unknown> {
    return this.http.delete(`${this.resourceUrl}/${encodeURIComponent(id)}`, { params: { idToken } });
  }
}
