import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { LoginComponent } from './login/login.component';
import { ShellComponent } from './shell/shell.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { DonorListComponent } from './members/donor-list/donor-list.component';
import { DonationComponent } from './members/donation/donation.component';
import { ScholarshipListComponent } from './scholar/scholarship-list/scholarship-list.component';
import { ScholarshipApplyComponent } from './scholar/scholarship-apply/scholarship-apply.component';
import { ScholarAppliedComponent } from './scholar/scholar-applied/scholar-applied.component';
import { GalleryComponent } from './gallery/gallery.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members/member-list', component: MemberListComponent },
      { path: 'members/donor-list', component: DonorListComponent },
      { path: 'members/donation', component: DonationComponent },
      { path: 'scholar/scholarship-list', component: ScholarshipListComponent },
      { path: 'scholar/scholarship-apply', component: ScholarshipApplyComponent },
      { path: 'scholar/scholar-applied', component: ScholarAppliedComponent },
      { path: 'gallery', component: GalleryComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
