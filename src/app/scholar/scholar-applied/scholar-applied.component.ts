import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface Application {
  applicantName: string;
  scholarship: string;
  appliedOn: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

@Component({
  selector: 'app-scholar-applied',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './scholar-applied.component.html',
})
export class ScholarAppliedComponent implements OnInit {
  loading = true;
  searchTerm = '';
  statusFilter: 'All' | 'Pending' | 'Approved' | 'Rejected' = 'All';

  readonly applications: Application[] = [
    { applicantName: 'Deepa Naik', scholarship: 'Merit Scholarship for SSLC Toppers', appliedOn: '02 Jul 2024', status: 'Approved' },
    { applicantName: 'Kiran Shetty', scholarship: 'Undergraduate Support Grant', appliedOn: '05 Jul 2024', status: 'Pending' },
    { applicantName: 'Pooja Malli', scholarship: 'Girl Child Education Support', appliedOn: '08 Jul 2024', status: 'Pending' },
    { applicantName: 'Arjun Nayak', scholarship: 'Engineering Excellence Award', appliedOn: '01 Jun 2024', status: 'Rejected' },
    { applicantName: 'Sneha Kamath', scholarship: 'Postgraduate Research Grant', appliedOn: '11 Jul 2024', status: 'Pending' },
    { applicantName: 'Rahul Pai', scholarship: 'PU College Assistance', appliedOn: '20 Apr 2024', status: 'Approved' },
  ];

  ngOnInit(): void {
    setTimeout(() => (this.loading = false), 600);
  }

  get filteredApplications(): Application[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.applications.filter((application) => {
      const matchesSearch =
        !term ||
        application.applicantName.toLowerCase().includes(term) ||
        application.scholarship.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'All' || application.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
}
