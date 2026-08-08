import { AfterViewInit, Component, NgZone } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { GOOGLE_CLIENT_ID, decodeGoogleIdToken } from '../core/google-identity';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements AfterViewInit {
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
      client_id: GOOGLE_CLIENT_ID,
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
    const payload = decodeGoogleIdToken(response?.credential);
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
}