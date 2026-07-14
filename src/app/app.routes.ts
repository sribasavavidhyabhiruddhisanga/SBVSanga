import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { DonorListComponent } from './members/donor-list/donor-list.component';
import { DonationComponent } from './members/donation/donation.component';
import { ScholarshipListComponent } from './scholar/scholarship-list/scholarship-list.component';
import { ScholarshipApplyComponent } from './scholar/scholarship-apply/scholarship-apply.component';
import { ScholarAppliedComponent } from './scholar/scholar-applied/scholar-applied.component';
import { UpcomingEventsComponent } from './updates/upcoming-events/upcoming-events.component';
import { GalleryComponent } from './gallery/gallery.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    children: [
      // Public: viewable without signing in.
      { path: 'dashboard', component: DashboardComponent },

      // "Our Community" menu — any signed-in member.
      { path: 'community/member-list', component: MemberListComponent, canActivate: [authGuard] },
      { path: 'community/donor-list', component: DonorListComponent, canActivate: [authGuard] },
      { path: 'community/scholarship-list', component: ScholarshipListComponent, canActivate: [authGuard] },
      { path: 'community/donate', component: DonationComponent, canActivate: [authGuard] },
      { path: 'community/scholarship-apply', component: ScholarshipApplyComponent, canActivate: [authGuard] },

      // "Updates" menu — Admin members only.
      { path: 'updates/scholar-applied', component: ScholarAppliedComponent, canActivate: [adminGuard] },
      { path: 'updates/donation-list', component: DonationComponent, canActivate: [adminGuard] },
      { path: 'updates/upcoming-events', component: UpcomingEventsComponent, canActivate: [adminGuard] },

      { path: 'gallery', component: GalleryComponent, canActivate: [authGuard] },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
