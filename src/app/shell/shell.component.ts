import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';

declare global {
  interface Window {
    google: any;
  }
}

type DesktopMenu = 'members' | 'scholar' | null;

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly year = new Date().getFullYear();

  userMenuOpen = false;
  mobileMenuOpen = false;
  mobileMembersOpen = false;
  mobileScholarOpen = false;
  openDesktopMenu: DesktopMenu = null;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeAllMenus());
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.userMenuOpen = false;
    this.openDesktopMenu = null;
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
    this.openDesktopMenu = null;
  }

  toggleDesktopMenu(menu: DesktopMenu, event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = false;
    this.openDesktopMenu = this.openDesktopMenu === menu ? null : menu;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  toggleMobileGroup(group: 'members' | 'scholar'): void {
    if (group === 'members') {
      this.mobileMembersOpen = !this.mobileMembersOpen;
    } else {
      this.mobileScholarOpen = !this.mobileScholarOpen;
    }
  }

  isMembersActive(): boolean {
    return this.router.url.startsWith('/members');
  }

  isScholarActive(): boolean {
    return this.router.url.startsWith('/scholar');
  }

  closeAllMenus(): void {
    this.userMenuOpen = false;
    this.openDesktopMenu = null;
    this.mobileMenuOpen = false;
    this.mobileMembersOpen = false;
    this.mobileScholarOpen = false;
  }

  logout(): void {
    const email = this.authService.user?.emailId;

    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();

      if (email) {
        window.google.accounts.id.revoke(email, () => {});
      }
    }

    this.authService.clearUser();
    this.closeAllMenus();
    this.router.navigateByUrl('/login');
  }
}
