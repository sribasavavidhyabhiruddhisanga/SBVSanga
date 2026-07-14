import { AfterViewInit, Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';

declare global {
  interface Window {
    google: any;
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit {
  private readonly clientId =
    '1985573387-kvmrn1nm19t9hrm0iqelnc4bn67lblo1.apps.googleusercontent.com';

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private zone: NgZone,
  ) {}

  ngAfterViewInit(): void {
    if (this.authService.isLoggedIn) {
      this.router.navigateByUrl('/dashboard');
      return;
    }

    if (!window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: this.clientId,
      callback: (response: any) => this.handleCredential(response),
    });

    window.google.accounts.id.renderButton(
      document.getElementById('googleBtn'),
      {
        theme: 'filled_blue',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'signin_with',
      },
    );
  }

  private handleCredential(response: any): void {
    const payload = this.parseJwt(response?.credential);
    const emailId: string = payload?.email || '';

    this.authService.verifyMembership(emailId).subscribe((match) => {
      this.zone.run(() => {
        if (match) {
          this.authService.setUser({
            username: payload?.name || match.userName || match.name || 'User',
            emailId,
            picture: payload?.picture || '',
            userType: match.userType,
          });

          this.router.navigateByUrl('/dashboard');
          return;
        }

        this.authService.revokeGoogleSession(emailId);
        this.toastService.show('You are not a Member, please check with administrator', 'error');
        this.router.navigateByUrl('/dashboard');
      });
    });
  }

  private parseJwt(token: string): any {
    if (!token) {
      return {};
    }

    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join(''),
    );

    return JSON.parse(jsonPayload);
  }
}