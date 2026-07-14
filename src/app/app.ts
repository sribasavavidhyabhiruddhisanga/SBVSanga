import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { IdleService } from './core/idle.service';
import { ToastService } from './core/toast.service';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = signal('basavaVidyaBhiruddhiSanga');

  constructor(
    private authService: AuthService,
    private idleService: IdleService,
    private toastService: ToastService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLoggedIn) => (isLoggedIn ? this.idleService.start() : this.idleService.stop()));

    this.idleService.idle$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.authService.isLoggedIn) {
        return;
      }

      this.authService.signOut();
      this.toastService.show("You've been signed out after 2 minutes of inactivity.", 'info');
      this.router.navigateByUrl('/dashboard');
    });
  }
}
