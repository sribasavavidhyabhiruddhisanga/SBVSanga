import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';

type DesktopMenu = 'community' | 'updates' | null;
type MobileGroup = 'community' | 'updates';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly year = new Date().getFullYear();

  userMenuOpen = false;
  mobileMenuOpen = false;
  mobileCommunityOpen = false;
  mobileUpdatesOpen = false;
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

  toggleMobileGroup(group: MobileGroup): void {
    if (group === 'community') {
      this.mobileCommunityOpen = !this.mobileCommunityOpen;
    } else {
      this.mobileUpdatesOpen = !this.mobileUpdatesOpen;
    }
  }

  isCommunityActive(): boolean {
    return this.router.url.startsWith('/community');
  }

  isUpdatesActive(): boolean {
    return this.router.url.startsWith('/updates');
  }

  closeAllMenus(): void {
    this.userMenuOpen = false;
    this.openDesktopMenu = null;
    this.mobileMenuOpen = false;
    this.mobileCommunityOpen = false;
    this.mobileUpdatesOpen = false;
  }

  logout(): void {
    this.authService.signOut();
    this.closeAllMenus();
    this.router.navigateByUrl('/login');
  }
}
