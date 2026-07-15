import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { HeroBannerComponent } from '../shared/hero-banner/hero-banner.component';
import { SectionIntroComponent } from '../shared/section-intro/section-intro.component';
import { ProfileCardComponent } from '../shared/profile-card/profile-card.component';

interface MajorDonor {
  image: string;
  alt: string;
  caption: string;
  /** CSS object-position for the photo; lets a badly-centered source photo be re-framed. */
  objectPosition: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterModule, HeroBannerComponent, SectionIntroComponent, ProfileCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}

  readonly majorDonors: MajorDonor[] = [
    {
      image: 'assets/dashboardImages/nagabhushan.jpg',
      alt: 'ಡಾ! ನಾಗಭೂಷಣ ಸ್ವಾಮಿ',
      caption: 'ಲಿಂಗೈಕ್ಯ ಡಾ! ನಾಗಭೂಷಣ ಸ್ವಾಮಿ ಮತ್ತು ಶ್ರೀಮತಿ ಸುವರ್ಣ ನಾಗಭೂಷಣ ಸ್ವಾಮಿ ದಂಪತಿ',
      objectPosition: 'center',
    },
    {
      image: 'assets/dashboardImages/shashidhar.jpg',
      alt: 'ಶ್ರೀ ಶಶಿಧರ್',
      caption: 'ಹಾಸನದ ಸೌಭಾಗ್ಯ ಓಂಕಾರಪ್ಪ ನವರ ಪುತ್ರ ಶ್ರೀ ಶಶಿಧರ್',
      // Source photo is a tall full-body shot with the face right at the top edge —
      // anchor the crop to the top so the circular thumbnail shows his face, not his shirt.
      objectPosition: 'center top',
    },
  ];
}
