import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface Donor {
  name: string;
  email: string;
  totalDonated: number;
  donationsCount: number;
  lastDonation: string;
}

@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './donor-list.component.html',
})
export class DonorListComponent implements OnInit {
  loading = true;
  searchTerm = '';

  readonly donors: Donor[] = [
    { name: 'Ramesh Kulkarni', email: 'ramesh.kulkarni@example.com', totalDonated: 25000, donationsCount: 4, lastDonation: '02 Jun 2024' },
    { name: 'Suresh Patil', email: 'suresh.patil@example.com', totalDonated: 12000, donationsCount: 2, lastDonation: '18 May 2024' },
    { name: 'Lakshmi Hegde', email: 'lakshmi.hegde@example.com', totalDonated: 50000, donationsCount: 6, lastDonation: '30 Jun 2024' },
    { name: 'Anitha Desai', email: 'anitha.desai@example.com', totalDonated: 7500, donationsCount: 1, lastDonation: '11 Apr 2024' },
    { name: 'Vijay Kumbhar', email: 'vijay.kumbhar@example.com', totalDonated: 18500, donationsCount: 3, lastDonation: '22 Jun 2024' },
    { name: 'Manjula Rao', email: 'manjula.rao@example.com', totalDonated: 32000, donationsCount: 5, lastDonation: '09 Jul 2024' },
  ];

  ngOnInit(): void {
    setTimeout(() => (this.loading = false), 600);
  }

  get filteredDonors(): Donor[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.donors.filter(
      (donor) => !term || donor.name.toLowerCase().includes(term) || donor.email.toLowerCase().includes(term),
    );
  }

  get totalRaised(): number {
    return this.donors.reduce((sum, donor) => sum + donor.totalDonated, 0);
  }

  get averageDonation(): number {
    return this.donors.length ? Math.round(this.totalRaised / this.donors.length) : 0;
  }
}
