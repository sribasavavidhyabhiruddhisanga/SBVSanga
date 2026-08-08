import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { API_BASE_URL } from './api-base';

export interface AppUser {
  username: string;
  emailId: string;
  picture?: string;
  userType?: string;
}

interface MembershipMatch {
  name: string;
  userName: string;
  userType: string;
}

interface VerifyResponse {
  member: boolean;
  name?: string;
  userName?: string;
  userType?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'google_signin_user';
  private readonly verifyUrl = `${API_BASE_URL}/auth/verify`;

  private readonly userSubject = new BehaviorSubject<AppUser | null>(this.readUser());
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(
    this.userSubject.value !== null,
  );

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

  private get isFinance(): boolean {
    return (this.user?.userType ?? '').toLowerCase() === 'finance';
  }

  private get isScholarship(): boolean {
    return (this.user?.userType ?? '').toLowerCase() === 'scholarship';
  }

  /** Admin or Scholarship — allowed to view the Scholarship Applied page and menu item. */
  get canViewScholarApplied(): boolean {
    return this.isAdmin || this.isScholarship;
  }

  /** Admin or Finance — allowed to view Donation List and Members Registered. */
  get canViewFinance(): boolean {
    return this.isAdmin || this.isFinance;
  }

  /** Whether the Updates menu should appear at all — true for Admin, Finance, or Scholarship. */
  get canViewUpdatesMenu(): boolean {
    return this.canViewScholarApplied || this.canViewFinance;
  }

  /**
   * Looks up the given email against the members whitelist server-side — the whitelist itself
   * (everyone's name/email/role) never reaches the browser, only this one match, if any.
   */
  verifyMembership(emailId: string): Observable<MembershipMatch | undefined> {
    return this.http
      .get<VerifyResponse>(this.verifyUrl, { params: { email: emailId.trim().toLowerCase() } })
      .pipe(
        map((response) =>
          response.member
            ? { name: response.name ?? '', userName: response.userName ?? '', userType: response.userType ?? '' }
            : undefined,
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
