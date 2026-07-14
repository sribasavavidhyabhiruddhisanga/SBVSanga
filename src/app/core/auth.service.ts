import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';

export interface AppUser {
  username: string;
  emailId: string;
  picture?: string;
  userType?: string;
}

export interface WhitelistEntry {
  id: string;
  name: string;
  userName: string;
  emailId: string;
  userType: string;
}

declare global {
  interface Window {
    google: any;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'google_signin_user';
  private readonly whitelistUrl = 'assets/userInfo/userInfo.json';

  private readonly userSubject = new BehaviorSubject<AppUser | null>(this.readUser());
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(this.userSubject.value !== null);

  readonly user$ = this.userSubject.asObservable();

  /** Simple boolean login-state stream, kept in sync with the signed-in user. */
  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  get user(): AppUser | null {
    return this.userSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  /** True for a signed-in member whose whitelist userType is Admin. */
  get isAdmin(): boolean {
    return (this.user?.userType ?? '').toLowerCase() === 'admin';
  }

  /** Looks up the given email in the members whitelist JSON; undefined when no match. */
  verifyMembership(emailId: string): Observable<WhitelistEntry | undefined> {
    return this.http.get<WhitelistEntry[]>(this.whitelistUrl).pipe(
      map((entries) =>
        entries.find((entry) => entry.emailId.toLowerCase() === emailId.trim().toLowerCase()),
      ),
      catchError(() => of(undefined)),
    );
  }

  setUser(user: AppUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
    this.isLoggedInSubject.next(true);
  }

  clearUser(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  /** Disables Google auto-select and revokes the given account's Google session. */
  revokeGoogleSession(emailId?: string | null): void {
    if (!window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.disableAutoSelect();

    if (emailId) {
      window.google.accounts.id.revoke(emailId, () => {});
    }
  }

  /** Complete sign-out routine: revokes the Google session and clears local state. */
  signOut(): void {
    this.revokeGoogleSession(this.user?.emailId);
    this.clearUser();
  }

  private readUser(): AppUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }
}
