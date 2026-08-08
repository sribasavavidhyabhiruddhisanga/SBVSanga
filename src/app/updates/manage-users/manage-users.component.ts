import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { GOOGLE_CLIENT_ID, decodeGoogleIdToken } from '../../core/google-identity';
import { ManagedUser, ManageUsersService, NewUserPayload } from '../manage-users.service';

interface ManageUsersViewModel {
  loading: boolean;
  error: boolean;
  users: ManagedUser[];
}

const ROLE_OPTIONS = ['Admin', 'Finance', 'Scholarship', 'Member'];

/**
 * Adding/removing a user grants or revokes app access (including Admin), so this page requires
 * a fresh Google identity confirmation — separate from the app's own sign-in — before any list,
 * add, or remove call. The backend independently re-verifies that token with Google on every
 * request; the confirmation here only unlocks the UI.
 */
@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [AsyncPipe, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './manage-users.component.html',
})
export class ManageUsersComponent implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly manageUsersService = inject(ManageUsersService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly roleOptions = ROLE_OPTIONS;

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  idToken: string | null = null;
  verifiedEmail: string | null = null;
  submitting = false;
  removingId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    userName: ['', Validators.required],
    emailId: ['', [Validators.required, Validators.email]],
    userType: ['Member', Validators.required],
  });

  private readonly users$: Observable<ManagedUser[] | 'error'> = this.refresh$.pipe(
    switchMap(() => {
      if (!this.idToken) {
        return of<ManagedUser[]>([]);
      }

      return this.manageUsersService.listUsers(this.idToken).pipe(
        catchError((error) => {
          this.toastService.show(extractApiErrorMessage(error, "Couldn't load users right now."), 'error');
          this.clearVerification();
          return of<'error'>('error');
        }),
      );
    }),
  );

  readonly vm$: Observable<ManageUsersViewModel> = this.users$.pipe(
    startWith(undefined),
    map((users): ManageUsersViewModel => {
      if (users === undefined) {
        return { loading: true, error: false, users: [] };
      }
      if (users === 'error') {
        return { loading: false, error: true, users: [] };
      }
      return { loading: false, error: false, users };
    }),
  );

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  private renderGoogleButton(): void {
    const target = document.getElementById('manageUsersGoogleBtn');

    if (!window.google?.accounts?.id || !target) {
      setTimeout(() => this.renderGoogleButton(), 300);
      return;
    }

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => this.handleVerified(response?.credential),
    });

    window.google.accounts.id.renderButton(target, {
      theme: 'filled_blue',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
    });
  }

  private handleVerified(credential: string | undefined): void {
    const claims = credential ? decodeGoogleIdToken(credential) : null;

    if (!credential || !claims?.email) {
      this.toastService.show('Could not confirm your identity. Please try again.', 'error');
      return;
    }

    this.idToken = credential;
    this.verifiedEmail = claims.email;
    this.refresh$.next();
    this.cdr.markForCheck();
  }

  private clearVerification(): void {
    this.idToken = null;
    this.verifiedEmail = null;
    this.cdr.markForCheck();
    setTimeout(() => this.renderGoogleButton(), 0);
  }

  addUser(): void {
    if (this.form.invalid || this.submitting || !this.idToken) {
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue() as NewUserPayload;

    this.manageUsersService.addUser(this.idToken, value).subscribe({
      next: () => {
        this.submitting = false;
        this.form.reset({ name: '', userName: '', emailId: '', userType: 'Member' });
        this.toastService.show('User added.', 'success');
        this.refresh$.next();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.submitting = false;
        this.toastService.show(extractApiErrorMessage(error, 'Could not add the user. Please try again.'), 'error');
        this.cdr.markForCheck();
      },
    });
  }

  removeUser(user: ManagedUser): void {
    if (this.removingId || !this.idToken) {
      return;
    }

    this.removingId = user.id;

    this.manageUsersService.removeUser(this.idToken, user.id).subscribe({
      next: () => {
        this.removingId = null;
        this.toastService.show('User removed.', 'success');
        this.refresh$.next();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.removingId = null;
        this.toastService.show(
          extractApiErrorMessage(error, 'Could not remove the user. Please try again.'),
          'error',
        );
        this.cdr.markForCheck();
      },
    });
  }

  isSelf(user: ManagedUser): boolean {
    return (user.emailId || '').toLowerCase() === (this.verifiedEmail || '').toLowerCase();
  }
}
