import { AsyncPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { LanguageService } from '../core/language.service';
import { extractApiErrorMessage } from '../core/api-error.util';
import { toIsoDate, formatDisplayDate } from '../core/date.util';
import { HeroBannerComponent } from '../shared/hero-banner/hero-banner.component';
import { SectionIntroComponent } from '../shared/section-intro/section-intro.component';
import { ProfileCardComponent } from '../shared/profile-card/profile-card.component';
import { UpcomingEventRecord, UpcomingEventsService } from '../updates/upcoming-events.service';

interface LocalizedText {
  kn: string;
  en: string;
}

interface MajorDonor {
  image: string;
  alt: LocalizedText;
  caption: LocalizedText;
  /** CSS object-position for the photo; lets a badly-centered source photo be re-framed. */
  objectPosition: string;
}

interface SatvikaAwardee {
  year: string;
  description: LocalizedText;
}

interface DashboardStrings {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  viewMembers: string;
  scholarshipsBtn: string;
  galleryBtn: string;
  membersLogin: string;
  signedInAs: string;
  emailLabel: string;
  signedInWith: string;
  googleLabel: string;
  announcementsLabel: string;
  motto1: string;
  motto2: string;
  motto3: string;
  founded: string;
  orgName: string;
  yearsOfService: string;
  aboutFooterTagline: string;
  legacyEyebrow: string;
  legacyTitle: string;
  hosalappaAlt: string;
  hosalappaDesc: string;
  chandrashekarAlt: string;
  chandrashekarDesc: string;
  schoolChildrenAlt: string;
  impactCallout1: string;
  impactCallout2: string;
  majorDonorsTitle: string;
  majorDonorsSubtitle: string;
  majorDonorsFooter: string;
  rankaEyebrow: string;
  rankaTitle: string;
  rankaSubtitle: string;
  rankaBody: string;
  rankaYearsBadge: string;
  rankaStudentsBadge: string;
  rankaThanks: string;
  rankaAlt: string;
  satvikaTitle: string;
  satvikaSubtitle: string;
  satvikaHistoryTitle: string;
  satvikaHistoryText: string;
  satvikaRollCallTitle: string;
}

const KN_STRINGS: DashboardStrings = {
  heroEyebrow: 'ಸ್ವಾಗತ',
  heroTitle: 'ಶ್ರೀ ಬಸವ ವಿದ್ಯಾಭಿವೃದ್ಧಿ ಸಂಘ',
  heroSubtitle: 'ನಡೆದಾಡುವ ದೇವರು ಶ್ರೀ ಶ್ರೀ ಶ್ರೀ ಶಿವಕುಮಾರ ಮಹಾಸ್ವಾಮಿಗಳ ಕೃಪಾಶೀರ್ವಾದಗಳೊಂದಿಗೆ',
  viewMembers: 'ಸದಸ್ಯರನ್ನು ವೀಕ್ಷಿಸಿ',
  scholarshipsBtn: 'ವಿದ್ಯಾರ್ಥಿವೇತನಗಳು',
  galleryBtn: 'ಗ್ಯಾಲರಿ',
  membersLogin: 'ಸದಸ್ಯರ ಲಾಗಿನ್',
  signedInAs: 'ಸೈನ್ ಇನ್ ಆಗಿರುವವರು',
  emailLabel: 'ಇಮೇಲ್',
  signedInWith: 'ಇದರ ಮೂಲಕ ಸೈನ್ ಇನ್',
  googleLabel: 'ಗೂಗಲ್',
  announcementsLabel: 'ಪ್ರಕಟಣೆಗಳು',
  motto1: 'IIಧರ್ಮದಿಂದಲೇ ವಿಶ್ವಕ್ಕೆ ಶಾಂತಿII',
  motto2: 'IIಶಾಂತಿ - ಸಹಬಾಳ್ವೆ ಸರ್ವರಿಗಾಗಲಿII',
  motto3: 'IIಮಾನವ ಧರ್ಮಕ್ಕೆ ಜಯವಾಗಲಿII',
  founded: 'ಸ್ಥಾಪನೆ: 1981',
  orgName: 'ಶ್ರೀ ಬಸವ ವಿದ್ಯಾಭಿವೃದ್ದಿ ಸಂಘ',
  yearsOfService: '46 ವರ್ಷಗಳ ಸಾರ್ಥಕ ಸೇವೆಯಲ್ಲಿ',
  aboutFooterTagline: 'ಗ್ರಾಮೀಣ ಭಾಗದ ವಿದ್ಯಾರ್ಥಿಗಳ ಅಭ್ಯುದಯಕ್ಕಾಗಿ….',
  legacyEyebrow: 'ನಮ್ಮ ಪರಂಪರೆ',
  legacyTitle: 'ಈ ಸಂಘವನ್ನು ಕಟ್ಟಿದ ಮಹನೀಯರು',
  hosalappaAlt: 'ಸಂಸ್ಥಾಪಕ ಅಧ್ಯಕ್ಷರು ಶ್ರೀ ಹೊಸಳ್ಳಪ್ಪನವರು',
  hosalappaDesc:
    'ಸಂಸ್ಥಾಪಕ ಅಧ್ಯಕ್ಷರು ಶ್ರೀ ಹೊಸಳ್ಳಪ್ಪನವರು, ನಿವೃತ್ತ ವ್ಯವಸ್ಥಾಪಕರು, ಕೃಷಿ ಇಲಾಖೆ, ಬೆಂಗಳೂರು.. ಇವರ ನೇತೃತ್ವದಲ್ಲಿ ಹಲವಾರು ಮಹನೀಯರು ಒಂದು ಮಹತ್ತರ ಧ್ಯೇಯದೊಂದಿಗೆ ಈ ಸಂಸ್ಥೆಯನ್ನು ಹುಟ್ಟು ಹಾಕಿದರು',
  chandrashekarAlt: 'ಜಸ್ಟಿಸ್ ಡಿ ಎಂ ಚಂದ್ರಶೇಖರ್',
  chandrashekarDesc:
    'ನಮ್ಮ ಸಂಘವನ್ನು ಮುಂದಿನ ಹಂತಕ್ಕೆ ತೆಗೆದುಕೊಂಡು ಹೋದವರು ಉಚ್ಚ ನ್ಯಾಯಾಲಯದ ನ್ಯಾಯಾಧೀಶರಾಗಿದ್ದ ಸರಳ ಸಜ್ಜನಿಕೆಯ ಸಾಕಾರ ಮೂರ್ತಿ ಕೀರ್ತಿಶೇಷ ಜಸ್ಟಿಸ್ ಡಿ ಎಂ ಚಂದ್ರಶೇರ್ ಅವರು',
  schoolChildrenAlt: 'ಶಾಲಾ ಮಕ್ಕಳು',
  impactCallout1: 'ಮಕ್ಕಳ ಪ್ರತಿಭೆಗಳ ಅನ್ವೇಷಣೆ ಮತ್ತು ಪ್ರೋತ್ಸಾಹ',
  impactCallout2: 'ಗ್ರಾಮೀಣ ಬಡ ಮಕ್ಕಳ ವಿದ್ಯಾಭ್ಯಾಸಕ್ಕೆ ಆರ್ಥಿಕ ಸಹಾಯ',
  majorDonorsTitle: 'ದಾನಿಗಳೇ ನಮ್ಮ ಸಂಘದ ಆಧಾರ',
  majorDonorsSubtitle: 'ಇವರಿಬ್ಬರು ₹ 10 ಲಕ್ಷ ದೇಣಿಗೆ ನೀಡಿರುವ ಮಹಾದಾನಿಗಳು',
  majorDonorsFooter: 'ಸಾವಿರಾರು ದಾನಿಗಳ ಹಣದಿಂದ ನಮ್ಮ ಸಂಘ ಸೇವೆಯನ್ನು ಮುಂದುವರೆಸಲು ಸಾಧ್ಯವಾಗಿದೆ',
  rankaEyebrow: 'ಕೃತಜ್ಞತೆ',
  rankaTitle: 'ಶ್ರೀ ಬಾಬುಲಾಲ್ ರಂಕಾ ಅವರಿಗೆ ಹೃತ್ಪೂರ್ವಕ ಕೃತಜ್ಞತೆಗಳು',
  rankaSubtitle: 'ರಂಕಾ ಸೆಂಟರ್ — ಡಿ. ಆರ್. ರಂಕಾ ಚಾರಿಟೆಬಲ್ ಟ್ರಸ್ಟ್, ಜಯನಗರ, ಬೆಂಗಳೂರು',
  rankaBody:
    "ಜಯನಗರ, ಬೆಂಗಳೂರಿನಲ್ಲಿ 'ಡಿ. ಆರ್. ರಂಕಾ ಚಾರಿಟೆಬಲ್ ಟ್ರಸ್ಟ್' ಅಡಿಯಲ್ಲಿ 'ರಂಕಾ ಸೆಂಟರ್' ಅನ್ನು ನಡೆಸುತ್ತಿರುವ ಶ್ರೀ ಬಾಬುಲಾಲ್ ರಂಕಾ ಅವರು ಕಳೆದ 15 ವರ್ಷಗಳಿಂದ ನಿರಂತರವಾಗಿ, ಪ್ರತಿ ವರ್ಷ ಸುಮಾರು 25 ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನ ನೀಡುವ ಮೂಲಕ ನಮ್ಮ ಸಂಘದ ಸೇವಾಕಾರ್ಯಕ್ಕೆ ಅಪಾರ ಕೊಡುಗೆ ನೀಡುತ್ತಿದ್ದಾರೆ. ಅವರ ಈ ಅವಿರತ ಔದಾರ್ಯ ಮತ್ತು ಶಿಕ್ಷಣ ಪ್ರೀತಿಗೆ ನಾವು ಚಿರಋಣಿಗಳಾಗಿದ್ದೇವೆ. ಅವರ ಸೇವೆ ಗ್ರಾಮೀಣ ಬಡ ಮಕ್ಕಳ ಬದುಕಿನಲ್ಲಿ ಶಾಶ್ವತ ಬೆಳಕಾಗಿ ಉಳಿಯುತ್ತದೆ.",
  rankaYearsBadge: '15+ ವರ್ಷಗಳ ಸೇವೆ',
  rankaStudentsBadge: 'ವರ್ಷಕ್ಕೆ ~25 ವಿದ್ಯಾರ್ಥಿಗಳು',
  rankaThanks: 'ತಮ್ಮ ಔದಾರ್ಯ ಮತ್ತು ಬದ್ಧತೆಗೆ ಅನಂತ ಧನ್ಯವಾದಗಳು.',
  rankaAlt: 'ಶ್ರೀ ಬಾಬುಲಾಲ್ ರಂಕಾ',
  satvikaTitle: 'ಸಾತ್ವಿಕ ಪ್ರಶಸ್ತಿ',
  satvikaSubtitle:
    'ಎಲೆಮರೆಯ ಕಾಯಿಯಂತೆ ಕನ್ನಡ ಸಾಹಿತ್ಯ ಕೃಷಿಯಲ್ಲಿ ತೊಡಗಿಸಿಕೊಂಡಿರುವ ಬಡ ಸಾಹಿತಿಗಳನ್ನು ಗುರುತಿಸಿ ಸನ್ಮಾನಿಸಿ ಆರ್ಥಿಕ ನೆರವು ನೀಡುವ ಉದ್ದೇಶ',
  satvikaHistoryTitle: 'ಸಾತ್ವಿಕ ಪ್ರಶಸ್ತಿ',
  satvikaHistoryText:
    'ಕನ್ನಡ ಪ್ರಾಧ್ಯಾಪಕರಾಗಿ, ಕನ್ನಡ ನಿಘಂಟುಕಾರರಾಗಿ, ಸರಳ ವ್ಯಕ್ತಿತ್ವಕ್ಕೆ ಹೆಸರಾದ ಪೋ. ಟಿ.ಆರ್.ಮಹಾದೇವಯ್ಯನವರಿಗೆ ಅವರ ಶಿಷ್ಯರು, ಮಿತ್ರರು, ಅಭಿಮಾನಿಗಳು 1995ರಲ್ಲಿ ಅವರ ಷಷ್ಠಿ ಸಂದರ್ಭದಲ್ಲಿ ಅಭಿನಂದನಾ ಸಮಾರಂಭ ಏರ್ಪಡಿಸಿ ಒಂದು ಲಕ್ಷ ರುಪಾಯಿಗಳ ನಿಧಿಯನ್ನು ಅರ್ಪಿಸಿದರು. ಶ್ರೀಯುತರು ಈ ಹಣವನ್ನು ಸ್ವಂತಕ್ಕೆ ಬಳಸದೆ ಬೆಳೆಸಿ 2 ಲಕ್ಷ ರುಪಾಯಿಗಳ ಪುದುವಟ್ಟನ್ನು ಸಾತ್ವಿಕ ಪ್ರಶಸ್ತಿ ನಿಧಿ ಎಂದು ಶ್ರೀ ಬಸವ ವಿಧ್ಯಾಭಿವೃದ್ಧಿ ಸಂಘದಲ್ಲಿಟ್ಟಿದ್ದಾರೆ. ಮುಂದುವರೆದು ಅವರ ಹಿತೈಷಿಗಳು, ಸಾಹಿತಿಗಳು ಮತ್ತು ಬಂಧು - ಮಿತ್ರರು ಕೈ ಜೋಡಿಸಿ ಒಟ್ಟು ಐದು ಲಕ್ಷ ಸಂಗ್ರಹಿಸಿದ್ದಾರೆ. ಅದರಲ್ಲಿ ಬರುವ ಬಡ್ಡಿಯಲ್ಲಿ ಶ್ರೀ ಟಿ ಆರ್ ಎಂ ಅವರ ಆಶಯದಂತೆ ಪ್ರತಿ ವರ್ಷ ಎಲೆ ಮರೆಯ ಕಾಯಿಯಂತೆ ಕನ್ನಡ ಸಾಹಿತ್ಯ ಸೇವೆ ಮಾಡುತ್ತಿರುವ ಹಾಗೂ ಆರ್ಥಿಕವಾಗಿ ಸಂಕಷ್ಟದಲ್ಲಿರುವ ಸಜ್ಜನ ಸಾಹಿತಿಯೊಬ್ಬರಿಗೆ ಸಾತ್ವಿಕ ಪ್ರಶಸ್ತಿ ನೀಡಿ ಸನ್ಮಾನಿಸಲಾಗುತ್ತಿದೆ.',
  satvikaRollCallTitle: 'ಇವರೆಲ್ಲರೂ ಈ ಪ್ರಶಸ್ತಿಗೆ ಭಾಜನರಾದ ಗೌರವಾನ್ವಿತ ವ್ಯಕ್ತಿಗಳು',
};

const EN_STRINGS: DashboardStrings = {
  heroEyebrow: 'Welcome',
  heroTitle: 'Sri Basava Vidyabhivruddhi Sangha',
  heroSubtitle: 'With the blessings of the living god, Sri Sri Sri Shivakumara Mahaswamiji',
  viewMembers: 'View Members',
  scholarshipsBtn: 'Scholarships',
  galleryBtn: 'Gallery',
  membersLogin: 'Members Login',
  signedInAs: 'Signed in as',
  emailLabel: 'Email',
  signedInWith: 'Signed in with',
  googleLabel: 'Google',
  announcementsLabel: 'Announcements',
  motto1: 'II Peace to the World through Dharma II',
  motto2: 'II May Peace and Harmony Prevail for All II',
  motto3: "II Glory to Humanity's Dharma II",
  founded: 'Founded: 1981',
  orgName: 'Sri Basava Vidyabhivruddhi Sangha',
  yearsOfService: '46 Years of Dedicated Service',
  aboutFooterTagline: 'For the upliftment of rural students….',
  legacyEyebrow: 'Our Legacy',
  legacyTitle: 'The people who built this Sangha',
  hosalappaAlt: 'Founder President Sri Hosallappa',
  hosalappaDesc:
    'Founder President Sri Hosallappa, retired Manager, Department of Agriculture, Bengaluru. Under his leadership, several eminent personalities founded this institution with a great vision.',
  chandrashekarAlt: 'Justice D. M. Chandrashekar',
  chandrashekarDesc:
    'The person who took our Sangha to the next level was the late Justice D. M. Chandrashekar, a former High Court judge and the very embodiment of simplicity and grace.',
  schoolChildrenAlt: 'School Children',
  impactCallout1: "Discovering and Encouraging Children's Talents",
  impactCallout2: 'Financial Support for the Education of Poor Rural Children',
  majorDonorsTitle: 'Our Donors Are the Foundation of Our Sangha',
  majorDonorsSubtitle: 'These two great benefactors have each donated ₹10 lakh',
  majorDonorsFooter:
    'It is with the contributions of thousands of donors that our Sangha is able to continue its service',
  rankaEyebrow: 'Gratitude',
  rankaTitle: 'Heartfelt Thanks to Sri Babulal Ranka',
  rankaSubtitle: 'Ranka Center — D. R. Ranka Charitable Trust, Jayanagar, Bengaluru',
  rankaBody:
    'Sri Babulal Ranka, who runs the Ranka Center under the D. R. Ranka Charitable Trust in Jayanagar, Bengaluru, has been an extraordinary pillar of support for our Sangha — continuously sponsoring scholarships for about 25 students every single year for the past 15 years. We remain deeply grateful for his unwavering generosity and his abiding love for education. His service will forever remain a guiding light in the lives of underprivileged rural children.',
  rankaYearsBadge: '15+ Years of Service',
  rankaStudentsBadge: '~25 Students Every Year',
  rankaThanks: 'With our deepest thanks for your generosity and commitment.',
  rankaAlt: 'Sri Babulal Ranka',
  satvikaTitle: 'Satvika Prashasti',
  satvikaSubtitle:
    'An initiative to identify, honour, and financially support underprivileged litterateurs who quietly cultivate Kannada literature, like the unseen fruit behind the leaf',
  satvikaHistoryTitle: 'Satvika Prashasti',
  satvikaHistoryText:
    "Prof. T. R. Mahadevaiah — a Kannada professor, lexicographer, and a man renowned for his simplicity — was honoured by his students, friends, and admirers with a felicitation ceremony in 1995 to mark his 60th birthday (Shashti), at which they presented him a fund of one lakh rupees. Rather than using this money for himself, he grew it into a corpus of two lakh rupees and deposited it with Sri Basava Vidyabhivruddhi Sangha as the Satvika Prashasti fund. His well-wishers, fellow writers, and relatives and friends subsequently joined hands to raise a total of five lakh rupees. In keeping with Sri T. R. M.'s wish, the interest earned from this corpus is used every year to honour a gracious litterateur who, like the unseen fruit behind the leaf, quietly serves Kannada literature while facing financial hardship, with the Satvika Prashasti.",
  satvikaRollCallTitle: 'These Are the Esteemed Recipients of This Award',
};

function latestUpcoming(events: UpcomingEventRecord[]): UpcomingEventRecord[] {
  const todayIso = toIsoDate(new Date());

  return [...events]
    .filter((event) => !!event.date && event.date >= todayIso)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6);
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    AsyncPipe,
    RouterModule,
    HeroBannerComponent,
    SectionIntroComponent,
    ProfileCardComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly eventsService = inject(UpcomingEventsService);
  private readonly toastService = inject(ToastService);
  private readonly languageService = inject(LanguageService);

  /** Current Dashboard language — 'kn' by default, toggled from the header (Dashboard-only). */
  readonly language = this.languageService.language;
  readonly t = computed(() => (this.language() === 'kn' ? KN_STRINGS : EN_STRINGS));

  /** Brief true window on every language switch, driving a CSS crossfade — no spinner needed
   *  since the swap is a synchronous local dictionary lookup, not an async wait. */
  readonly isTranslating = signal(false);

  constructor(public authService: AuthService) {
    this.languageService.reset();

    let isFirstRun = true;
    effect(() => {
      this.language();
      if (isFirstRun) {
        isFirstRun = false;
        return;
      }
      this.isTranslating.set(true);
      setTimeout(() => this.isTranslating.set(false), 180);
    });
  }

  /** Independent GET for the header announcements marquee — soonest-first upcoming events. */
  readonly announcements$: Observable<UpcomingEventRecord[]> = this.eventsService.getEvents().pipe(
    map((events) => latestUpcoming(events)),
    catchError((error) => {
      this.toastService.show(
        extractApiErrorMessage(error, "Couldn't load the latest announcements."),
        'error',
      );
      return of<UpcomingEventRecord[]>([]);
    }),
  );

  formatEventDate(dateValue: string): string {
    return dateValue ? formatDisplayDate(dateValue) : 'Date TBD';
  }

  readonly majorDonors: MajorDonor[] = [
    {
      image: 'assets/dashboardImages/nagabhushan.jpg',
      alt: { kn: 'ಡಾ! ನಾಗಭೂಷಣ ಸ್ವಾಮಿ', en: 'Dr. Nagabhushan Swamy' },
      caption: {
        kn: 'ಲಿಂಗೈಕ್ಯ ಡಾ! ನಾಗಭೂಷಣ ಸ್ವಾಮಿ ಮತ್ತು ಶ್ರೀಮತಿ ಸುವರ್ಣ ನಾಗಭೂಷಣ ಸ್ವಾಮಿ ದಂಪತಿ',
        en: 'The late Dr. Nagabhushan Swamy and Smt. Suvarna Nagabhushan Swamy, husband and wife',
      },
      objectPosition: 'center',
    },
    {
      image: 'assets/dashboardImages/shashidhar.jpg',
      alt: { kn: 'ಶ್ರೀ ಶಶಿಧರ್', en: 'Sri Shashidhar' },
      caption: {
        kn: 'ಹಾಸನದ ಸೌಭಾಗ್ಯ ಓಂಕಾರಪ್ಪ ನವರ ಪುತ್ರ ಶ್ರೀ ಶಶಿಧರ್',
        en: "Sri Shashidhar, son of Hassan's Soubhagya Omkarappa",
      },
      // Source photo is a tall full-body shot with the face right at the top edge —
      // anchor the crop to the top so the circular thumbnail shows his face, not his shirt.
      objectPosition: 'center top',
    },
  ];

  readonly satvikaAwardees: SatvikaAwardee[] = [
    {
      year: '2008',
      description: {
        kn: 'ಎಲೆಮರೆಯ ಕಾಯಿ ಶ್ರೀ ಹೋ.ರಾ. ಸತ್ಯನಾರಾಯಣ ರಾವ್ ರವರು',
        en: 'Sri Ho. Ra. Sathyanarayana Rao, an unassuming, unsung talent',
      },
    },
    {
      year: '2009',
      description: {
        kn: 'ಗ್ರಂಥ ವಿಜ್ಞಾನಿ ಡಾ.ಅರ್. ಶಿವಣ್ಣನವರು',
        en: 'Dr. R. Shivanna, library and information scholar',
      },
    },
    {
      year: '2010',
      description: {
        kn: 'ಸೂಕ್ತಿ ಸುಧಾವರ್ಣವ ಶ್ರೀ ಟಿ. ವಿ . ವೆಂಕಟರಮಣಯ್ಯನವರು',
        en: 'Sri T. V. Venkataramanayya, a fount of eloquent maxims',
      },
    },
    {
      year: '2011',
      description: {
        kn: 'ಅನುಭಾವಿ ಶ್ರೀ ಎಂ. ಚಂದ್ರಪ್ಪನವರು',
        en: 'Sri M. Chandrappa, mystic-philosopher',
      },
    },
    {
      year: '2012',
      description: { kn: 'ಶ್ರೀಮತಿ ತ್ರಿವೇಣಿ ಶಿವಕುಮಾರ್ ರವರು', en: 'Smt. Triveni Shivakumar' },
    },
    {
      year: '2013',
      description: {
        kn: 'ಜಾನಪದ ವಿದ್ವಾಂಸ ಶ್ರೀ ಹೆಚ್..ವಿ. ವೀರಭದ್ರಯ್ಯನವರು',
        en: 'Sri H. V. Veerabhadrayya, folklore scholar',
      },
    },
    {
      year: '2014',
      description: {
        kn: 'ಡಾ. ಜಿ. ವಿ. ಜಯಾ ರಾಜಶೇಖರ್ ಅವರು, ಲೇಖಕರು',
        en: 'Dr. G. V. Jaya Rajashekhar, writer',
      },
    },
    {
      year: '2015',
      description: {
        kn: 'ನಾಡೋಜ ಡಾ.ಬಿ. ಟಿ. ರುದ್ರೇಶ್ ರವರು, ಖ್ಯಾತ ಹೋಮಿಯೋಪತಿ ವೈದ್ಯರು ಹಾಗೂ ಲೇಖಕರು',
        en: 'Nadoja Dr. B. T. Rudresh, renowned homeopathy physician and writer',
      },
    },
    {
      year: '2016',
      description: {
        kn: 'ಮಹಾಕಾವ್ಯಗಳ ಸರದಾರ ಡಾ. ಪ್ರದೀಪ್ ಕುಮಾರ್ ಹೆಬ್ರಿ, ಸಾಹಿತಿಗಳು',
        en: 'Dr. Pradeep Kumar Hebri, the maestro of epics, litterateur',
      },
    },
    {
      year: '2017',
      description: {
        kn: 'ಶ್ರೀ ಪೌಳಿ ಶಂಕರಾನಂದಪ್ಪ ಕವಿಗಳು ಹಾಗೂ ಲೇಖಕರು',
        en: 'Sri Pauli Shankaranandappa, poet and writer',
      },
    },
    {
      year: '2018',
      description: { kn: 'ಶ್ರೀ ಹೆಚ್ . ಎಸ್. ಹಾಲೇಶ್, ಲೇಖಕರು', en: 'Sri H. S. Halesh, writer' },
    },
    {
      year: '2019',
      description: {
        kn: 'ಶ್ರೀ ಹೆಚ್.ಎಸ್. ಸಿದ್ದಗಂಗಪ್ಪ , ಸಾಹಿತಿಗಳು ಹಾಗೂ ಲೇಖಕರು',
        en: 'Sri H. S. Siddagangappa, litterateur and writer',
      },
    },
    {
      year: '2020',
      description: {
        kn: 'ಶ್ರೀ ಬ್ಯಾಡನೂರು ಶಾಂತವೀರಪ್ಪನವರು, ಸಾಹಿತಿ',
        en: 'Sri Byadanur Shantaveerappa, litterateur',
      },
    },
    {
      year: '2021',
      description: {
        kn: 'ಡಾ. ಮಲಯ ಶಾಂತಮುನಿ, ದೇಶೀಕೇಂದ್ರ ಶಿವಾಚಾರ್ಯ ಸ್ವಾಮಿಗಳು, ಶಿವಗಂಗಾ ಕ್ಷೇತ್ರ , ಆಧ್ಯಾತ್ಮಿಕ ಲೇಖಕರು',
        en: 'Dr. Malaya Shantamuni, Deshikendra Shivacharya Swamiji of Shivagange Kshetra, spiritual writer',
      },
    },
    {
      year: '2022',
      description: {
        kn: 'ಶತಾಯುಷಿ ಪ್ರೊ. ಸಿ. ಮಹಾದೇವಯ್ಯನವರು, ಹಿರಿಯ ಸಾಹಿತಿಗಳು',
        en: 'Centenarian Prof. C. Mahadevayya, senior litterateur',
      },
    },
    {
      year: '2023',
      description: {
        kn: 'ಶ್ರೀ ಕೆ. ಎಂ. ರೇವಣ್ಣನವರು, ಹಿರಿಯ ಸಾಹಿತಿಗಳು ಹಾಗೂ ಸಂಸ್ಕೃತ ಚಿಂತಕರು',
        en: 'Sri K. M. Revanna, senior litterateur and Sanskrit scholar',
      },
    },
    {
      year: '2024',
      description: {
        kn: 'ಡಾ. ಸಿ . ನಾಗಭೂಷಣ ಪ್ರಾಧ್ಯಾಪಕರು, ಕನ್ನಡ ಅಧ್ಯಯನ ಕೇಂದ್ರ, ಬೆಂ. ವಿ. ವಿ',
        en: 'Dr. C. Nagabhushan, Professor, Centre for Kannada Studies, Bengaluru University',
      },
    },
    {
      year: '2025',
      description: {
        kn: 'ಡಾ. ಬಿ. ಸಿದ್ಧಲಿಂಗಸ್ವಾಮಿ (ಬಿ.ಎಸ್.ಸ್ವಾಮಿ) ಸಾಹಿತಿಗಳು, ಚಿಂತಕರು',
        en: 'Dr. B. Siddalingaswamy (B. S. Swamy), litterateur and thinker',
      },
    },
    {
      year: '2026',
      description: {
        kn: 'ಡಾ. ಶಾಂತಾ ನಾಗರಾಜ್‌ರವರು ಖ್ಯಾತ ಲೇಖಕಿ ಹಾಗೂ ಪ್ರಾಧ್ಯಾಪಕರು',
        en: 'Dr. Shanta Nagaraj, renowned author and professor',
      },
    },
  ];
}
