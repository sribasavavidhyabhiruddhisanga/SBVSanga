import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, catchError, map, of, startWith, tap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DataTableColumn, DataTableComponent } from '../../shared/data-table/data-table.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { exportTableToPdf } from '../../core/pdf-export.util';
import { formatDisplayDate } from '../../core/date.util';
import { DonationRecord, DonationService } from '../donation.service';

const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/**
 * jsPDF's built-in fonts can't render the "₹" glyph — it comes out as a broken box in the
 * exported PDF. Using the ISO code instead of the symbol keeps the PDF's amount column ASCII-only.
 */
const PDF_INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  currencyDisplay: 'code',
  maximumFractionDigits: 0,
});

interface DonationRow extends DonationRecord {
  statusLabel: 'Paid' | 'Pending';
}

interface DonationListViewModel {
  loading: boolean;
  error: boolean;
  donations: DonationRow[];
}

/**
 * This app runs zoneless, so — same as Member List — the roster is built from a single
 * `vm$` consumed via the `async` pipe rather than a bare `.subscribe()` mutating plain fields.
 */
@Component({
  selector: 'app-donation-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './donation-list.component.html',
})
export class DonationListComponent {
  private readonly donationService = inject(DonationService);
  private readonly toastService = inject(ToastService);

  readonly columns: DataTableColumn[] = [
    { header: 'Donor', key: 'name', type: 'two-line', secondaryKey: 'address' },
    { header: 'Amount', key: 'amount', type: 'currency' },
    { header: 'Donating For', key: 'donationFor' },
    { header: 'Date', key: 'date' },
    {
      header: 'Status',
      key: 'statusLabel',
      type: 'badge',
      badgeClassMap: {
        Paid: 'bg-emerald-50 text-emerald-700',
        Pending: 'bg-stone-100 text-stone-500',
      },
    },
  ];

  private readonly donations$: Observable<DonationRecord[] | 'error'> = this.donationService.getDonations().pipe(
    catchError((error) => {
      this.toastService.show(extractApiErrorMessage(error, "Couldn't load donations right now."), 'error');
      return of<'error'>('error');
    }),
  );

  readonly vm$: Observable<DonationListViewModel> = this.donations$.pipe(
    startWith(undefined),
    map((donations): DonationListViewModel => {
      if (donations === undefined) {
        return { loading: true, error: false, donations: [] };
      }
      if (donations === 'error') {
        return { loading: false, error: true, donations: [] };
      }

      const rows: DonationRow[] = donations.map((donation) => ({
        ...donation,
        statusLabel: donation.paymentSuccessful ? 'Paid' : 'Pending',
      }));

      return { loading: false, error: false, donations: rows };
    }),
    tap((vm) => (this.latestDonations = vm.donations)),
  );

  /** Last successfully-loaded roster — kept for the PDF export, which runs outside the template. */
  private latestDonations: DonationRow[] = [];

  downloadPdf(): void {
    const rows = this.latestDonations.map((donation) => ({
      ...donation,
      amount: PDF_INR_FORMATTER.format(donation.amount),
      date: donation.date ? formatDisplayDate(donation.date) : '',
    }));

    exportTableToPdf({
      subtitle: 'Donation List',
      columns: [
        { header: 'Donor', key: 'name' },
        { header: 'Address', key: 'address' },
        { header: 'Amount', key: 'amount' },
        { header: 'Donating For', key: 'donationFor' },
        { header: 'Date', key: 'date' },
        { header: 'Status', key: 'statusLabel' },
      ],
      rows,
      fileName: 'donation-list',
    });
  }
}
