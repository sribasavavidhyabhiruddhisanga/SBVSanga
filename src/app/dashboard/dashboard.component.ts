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

interface SatvikaAwardee {
  year: string;
  description: string;
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

  readonly satvikaAwardees: SatvikaAwardee[] = [
    { year: '2008', description: 'ಎಲೆಮರೆಯ ಕಾಯಿ ಶ್ರೀ ಹೋ.ರಾ. ಸತ್ಯನಾರಾಯಣ ರಾವ್ ರವರು' },
    { year: '2009', description: 'ಗ್ರಂಥ ವಿಜ್ಞಾನಿ ಡಾ.ಅರ್. ಶಿವಣ್ಣನವರು' },
    { year: '2010', description: 'ಸೂಕ್ತಿ ಸುಧಾವರ್ಣವ ಶ್ರೀ ಟಿ. ವಿ . ವೆಂಕಟರಮಣಯ್ಯನವರು' },
    { year: '2011', description: 'ಅನುಭಾವಿ ಶ್ರೀ ಎಂ. ಚಂದ್ರಪ್ಪನವರು' },
    { year: '2012', description: 'ಶ್ರೀಮತಿ ತ್ರಿವೇಣಿ ಶಿವಕುಮಾರ್ ರವರು' },
    { year: '2013', description: 'ಜಾನಪದ ವಿದ್ವಾಂಸ ಶ್ರೀ ಹೆಚ್..ವಿ. ವೀರಭದ್ರಯ್ಯನವರು' },
    { year: '2014', description: 'ಡಾ. ಜಿ. ವಿ. ಜಯಾ ರಾಜಶೇಖರ್ ಅವರು, ಲೇಖಕರು' },
    { year: '2015', description: 'ನಾಡೋಜ ಡಾ.ಬಿ. ಟಿ. ರುದ್ರೇಶ್ ರವರು, ಖ್ಯಾತ ಹೋಮಿಯೋಪತಿ ವೈದ್ಯರು ಹಾಗೂ ಲೇಖಕರು' },
    { year: '2016', description: 'ಮಹಾಕಾವ್ಯಗಳ ಸರದಾರ ಡಾ. ಪ್ರದೀಪ್ ಕುಮಾರ್ ಹೆಬ್ರಿ, ಸಾಹಿತಿಗಳು' },
    { year: '2017', description: 'ಶ್ರೀ ಪೌಳಿ ಶಂಕರಾನಂದಪ್ಪ ಕವಿಗಳು ಹಾಗೂ ಲೇಖಕರು' },
    { year: '2018', description: 'ಶ್ರೀ ಹೆಚ್ . ಎಸ್. ಹಾಲೇಶ್, ಲೇಖಕರು' },
    { year: '2019', description: 'ಶ್ರೀ ಹೆಚ್.ಎಸ್. ಸಿದ್ದಗಂಗಪ್ಪ , ಸಾಹಿತಿಗಳು ಹಾಗೂ ಲೇಖಕರು' },
    { year: '2020', description: 'ಶ್ರೀ ಬ್ಯಾಡನೂರು ಶಾಂತವೀರಪ್ಪನವರು, ಸಾಹಿತಿ' },
    {
      year: '2021',
      description: 'ಡಾ. ಮಲಯ ಶಾಂತಮುನಿ, ದೇಶೀಕೇಂದ್ರ ಶಿವಾಚಾರ್ಯ ಸ್ವಾಮಿಗಳು, ಶಿವಗಂಗಾ ಕ್ಷೇತ್ರ , ಆಧ್ಯಾತ್ಮಿಕ ಲೇಖಕರು',
    },
    { year: '2022', description: 'ಶತಾಯುಷಿ ಪ್ರೊ. ಸಿ. ಮಹಾದೇವಯ್ಯನವರು, ಹಿರಿಯ ಸಾಹಿತಿಗಳು' },
    {
      year: '2023',
      description: 'ಶ್ರೀ ಕೆ. ಎಂ. ರೇವಣ್ಣನವರು, ಹಿರಿಯ ಸಾಹಿತಿಗಳು ಹಾಗೂ ಸಂಸ್ಕೃತ ಚಿಂತಕರು',
    },
    {
      year: '2024',
      description: 'ಡಾ. ಸಿ . ನಾಗಭೂಷಣ ಪ್ರಾಧ್ಯಾಪಕರು , ಕನ್ನಡ ಅಧ್ಯಯನ ಕೇಂದ್ರ, ಬೆಂ. ವಿ. ವಿ',
    },
  ];
}
