import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppUser {
  username: string;
  emailId: string;
  picture?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'google_signin_user';
  private readonly userSubject = new BehaviorSubject<AppUser | null>(this.readUser());

  readonly user$ = this.userSubject.asObservable();

  get user(): AppUser | null {
    return this.userSubject.value;
  }

  setUser(user: AppUser): void {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.userSubject.next(user);
  }

  clearUser(): void {
    localStorage.removeItem(this.storageKey);
    this.userSubject.next(null);
  }

  private readUser(): AppUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AppUser) : null;
  }
}