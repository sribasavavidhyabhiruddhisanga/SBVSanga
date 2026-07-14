import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface DonationRecord {
  donorName: string;
  amount: number;
  date: string;
  mode: string;
}

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './donation.component.html',
})
export class DonationComponent {
  submitting = false;
  submitted = false;

  readonly paymentModes = ['UPI', 'Cash', 'Bank Transfer', 'Cheque'];

  form: {
    donorName: string;
    amount: number | null;
    date: string;
    mode: string;
    notes: string;
  } = {
    donorName: '',
    amount: null,
    date: '',
    mode: 'UPI',
    notes: '',
  };

  recentDonations: DonationRecord[] = [
    { donorName: 'Manjula Rao', amount: 15000, date: '09 Jul 2024', mode: 'Bank Transfer' },
    { donorName: 'Lakshmi Hegde', amount: 10000, date: '30 Jun 2024', mode: 'UPI' },
    { donorName: 'Vijay Kumbhar', amount: 5000, date: '22 Jun 2024', mode: 'Cash' },
  ];

  submitDonation(): void {
    if (!this.form.donorName || !this.form.amount || !this.form.date) {
      return;
    }

    this.submitting = true;

    setTimeout(() => {
      this.recentDonations = [
        { donorName: this.form.donorName, amount: this.form.amount as number, date: this.form.date, mode: this.form.mode },
        ...this.recentDonations,
      ];

      this.submitting = false;
      this.submitted = true;
      this.form = { donorName: '', amount: null, date: '', mode: 'UPI', notes: '' };

      setTimeout(() => (this.submitted = false), 3000);
    }, 700);
  }
}
