import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { DonationRecord, DonationService } from '../donation.service';

/**
 * "Save Donation" never fires the API directly — it opens the UPI QR modal with a pending
 * payload (paymentSuccessful: false, date sourced from the server clock). Only "Payment
 * Complete" flips paymentSuccessful to true and posts. "Cancel" just drops the modal state;
 * the form itself is never touched, so the user's input survives a cancelled payment.
 *
 * This app runs zoneless, so state mutated inside an HTTP `.subscribe()` callback (as
 * opposed to a synchronous template event handler) never reaches the DOM on its own —
 * each subscribe callback below calls `cdr.markForCheck()` after mutating component state.
 */
@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './donation.component.html',
})
export class DonationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly donationService = inject(DonationService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly paymentModes = ['UPI'];
  readonly donationForOptions = ['Infrastructure', 'Scholarship', 'Satvika'];

  preparingPayment = false;
  submitting = false;
  showQrModal = false;
  showSuccessAlert = false;
  pendingDonation: DonationRecord | null = null;

  readonly form = this.fb.group({
    name: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    address: ['', Validators.required],
    notes: ['', Validators.required],
    paymentMode: ['UPI', Validators.required],
    donationFor: ['', Validators.required],
  });

  openPaymentModal(): void {
    if (this.form.invalid || this.preparingPayment) {
      return;
    }

    this.preparingPayment = true;
    const formValue = this.form.getRawValue();

    this.donationService.fetchState().subscribe({
      next: ({ serverDate }) => {
        this.preparingPayment = false;
        this.pendingDonation = {
          name: formValue.name ?? '',
          amount: formValue.amount ?? 0,
          address: formValue.address ?? '',
          notes: formValue.notes ?? '',
          paymentMode: formValue.paymentMode ?? 'UPI',
          donationFor: formValue.donationFor ?? '',
          date: serverDate,
          paymentSuccessful: false,
        };
        this.showQrModal = true;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.preparingPayment = false;
        this.toastService.show(
          extractApiErrorMessage(error, 'Could not start the payment. Please try again.'),
          'error',
        );
        this.cdr.markForCheck();
      },
    });
  }

  cancelPayment(): void {
    this.showQrModal = false;
    this.pendingDonation = null;
  }

  confirmPayment(): void {
    if (!this.pendingDonation || this.submitting) {
      return;
    }

    this.submitting = true;
    const payload: DonationRecord = { ...this.pendingDonation, paymentSuccessful: true };

    this.donationService
      .fetchState()
      .pipe(switchMap(({ donations }) => this.donationService.createDonation([...donations, payload])))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.showQrModal = false;
          this.pendingDonation = null;
          this.showSuccessAlert = true;
          this.form.reset({
            name: '',
            amount: null,
            address: '',
            notes: '',
            paymentMode: 'UPI',
            donationFor: '',
          });
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.submitting = false;
          this.toastService.show(
            extractApiErrorMessage(error, 'Could not record the donation. Please try again.'),
            'error',
          );
          this.cdr.markForCheck();
        },
      });
  }

  dismissSuccessAlert(): void {
    this.showSuccessAlert = false;
  }
}
