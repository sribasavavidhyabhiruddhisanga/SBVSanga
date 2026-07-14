import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}
}
