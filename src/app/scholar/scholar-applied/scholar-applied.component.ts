import { AsyncPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { MediaService } from '../../core/media.service';
import {
  ScholarshipApplication,
  ScholarshipDocLink,
  ScholarshipReceivedService,
} from '../scholarship-received.service';

interface ColumnDef {
  key: string;
  header: string;
  visible: boolean;
}

interface ScholarAppliedViewModel {
  loading: boolean;
  error: boolean;
  applications: ScholarshipApplication[];
}

type StatusFilter = 'All' | 'Pending' | 'Accept' | 'Reject';

/**
 * This app runs zoneless, so the roster loaded on init is built from a single `vm$` consumed
 * via the `async` pipe (see UpcomingEventsComponent for the same pattern). `refresh$` re-fetches
 * the full roster on init and after every status change, so the grid always reflects what the
 * server actually persisted rather than an optimistic local mutation.
 */
@Component({
  selector: 'app-scholar-applied',
  standalone: true,
  imports: [AsyncPipe, FormsModule, PageHeaderComponent],
  templateUrl: './scholar-applied.component.html',
})
export class ScholarAppliedComponent implements OnInit {
  private readonly scholarshipReceivedService = inject(ScholarshipReceivedService);
  private readonly mediaService = inject(MediaService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly refresh$ = new BehaviorSubject<void>(undefined);

  readonly statusTabs: StatusFilter[] = ['All', 'Pending', 'Accept', 'Reject'];

  searchTerm = '';
  statusFilter: StatusFilter = 'All';
  columnMenuOpen = false;
  statusUpdatingId: string | null = null;
  viewingKey: string | null = null;
  downloadingKey: string | null = null;

  readonly columns: ColumnDef[] = [
    { key: 'name', header: 'Applicant Name', visible: true },
    { key: 'emailId', header: 'Email ID', visible: true },
    { key: 'upiLinked_Phone', header: 'UPI Linked Phone Number', visible: true },
    { key: 'address', header: 'Complete Address', visible: true },
    { key: 'parentsName_occuptation', header: "Parent's Name & Occupation", visible: true },
    { key: 'institution Name', header: 'Institution Name', visible: true },
    { key: 'currentEducation', header: 'Current Education', visible: true },
    { key: 'percentage_marks', header: 'Percentage', visible: true },
    { key: 'accountHolderName', header: 'Bank Account Holder Name', visible: true },
    { key: 'bankName', header: 'Bank Name', visible: true },
    { key: 'accountNumber', header: 'Bank Account Number', visible: true },
    { key: 'ifscCode', header: 'IFSC Code', visible: true },
    { key: 'referredBy', header: 'Referred By', visible: true },
    { key: 'availedScholarship', header: 'Availed Scholarship?', visible: true },
    { key: 'score', header: 'Verification Score', visible: true },
    { key: 'status', header: 'Status', visible: true },
    { key: 'docLink', header: 'Document', visible: true },
  ];

  private readonly applications$: Observable<ScholarshipApplication[] | 'error'> = this.refresh$.pipe(
    switchMap(() =>
      this.scholarshipReceivedService.getApplications().pipe(
        catchError((error) => {
          this.toastService.show(
            extractApiErrorMessage(error, "Couldn't load scholarship applications right now."),
            'error',
          );
          return of<'error'>('error');
        }),
      ),
    ),
  );

  readonly vm$: Observable<ScholarAppliedViewModel> = this.applications$.pipe(
    startWith(undefined),
    map((applications): ScholarAppliedViewModel => {
      if (applications === undefined) {
        return { loading: true, error: false, applications: [] };
      }
      if (applications === 'error') {
        return { loading: false, error: true, applications: [] };
      }
      return { loading: false, error: false, applications };
    }),
  );

  ngOnInit(): void {
    this.refresh$.next();
  }

  get visibleColumns(): ColumnDef[] {
    return this.columns.filter((column) => column.visible);
  }

  toggleColumnMenu(): void {
    this.columnMenuOpen = !this.columnMenuOpen;
  }

  toggleColumn(column: ColumnDef): void {
    column.visible = !column.visible;
  }

  filterApplications(applications: ScholarshipApplication[]): ScholarshipApplication[] {
    const term = this.searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch = !term || application.name.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'All' || application.status === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  cellValue(row: ScholarshipApplication, key: string): string {
    const value = (row as unknown as Record<string, unknown>)[key];
    return value == null ? '' : String(value);
  }

  documentKey(application: ScholarshipApplication): string {
    return (application.docLink as ScholarshipDocLink)?.key ?? '';
  }

  setStatus(application: ScholarshipApplication, status: 'Accept' | 'Reject'): void {
    if (this.statusUpdatingId) {
      return;
    }

    this.statusUpdatingId = application.id;

    this.scholarshipReceivedService
      .getApplications()
      .pipe(
        switchMap((existing) => {
          const updated = existing.map((item) => (item.id === application.id ? { ...item, status } : item));
          return this.scholarshipReceivedService.updateApplications(updated);
        }),
      )
      .subscribe({
        next: () => {
          this.statusUpdatingId = null;
          this.toastService.show(`Application marked as ${status}.`, 'success');
          this.refresh$.next();
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.statusUpdatingId = null;
          this.toastService.show(
            extractApiErrorMessage(error, 'Could not update the application status. Please try again.'),
            'error',
          );
          this.cdr.markForCheck();
        },
      });
  }

  viewDocument(application: ScholarshipApplication): void {
    const key = this.documentKey(application);
    if (!key) {
      this.toastService.show('No document was attached to this application.', 'error');
      return;
    }

    this.viewingKey = key;

    this.mediaService.getDownloadUrl(key).subscribe({
      next: (url) => {
        this.viewingKey = null;
        window.open(url, '_blank', 'noopener');
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.viewingKey = null;
        this.toastService.show(extractApiErrorMessage(error, 'Could not open the document.'), 'error');
        this.cdr.markForCheck();
      },
    });
  }

  downloadDocument(application: ScholarshipApplication): void {
    const key = this.documentKey(application);
    if (!key) {
      this.toastService.show('No document was attached to this application.', 'error');
      return;
    }

    this.downloadingKey = key;

    this.mediaService.downloadFile(key).subscribe({
      next: (blob) => {
        this.downloadingKey = null;
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = key.split('/').pop() ?? 'document';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(objectUrl);
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.downloadingKey = null;
        this.toastService.show(extractApiErrorMessage(error, 'Could not download the document.'), 'error');
        this.cdr.markForCheck();
      },
    });
  }
}
