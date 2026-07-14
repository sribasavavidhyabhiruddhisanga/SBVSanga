import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface Scholarship {
  name: string;
  amount: number;
  eligibility: string;
  deadline: string;
  status: 'Open' | 'Closed';
}

@Component({
  selector: 'app-scholarship-list',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  templateUrl: './scholarship-list.component.html',
})
export class ScholarshipListComponent implements OnInit {
  loading = true;

  readonly scholarships: Scholarship[] = [
    {
      name: 'Merit Scholarship for SSLC Toppers',
      amount: 10000,
      eligibility: 'SSLC students scoring 90% and above',
      deadline: '31 Jul 2024',
      status: 'Open',
    },
    {
      name: 'Undergraduate Support Grant',
      amount: 25000,
      eligibility: 'First-year degree students',
      deadline: '15 Aug 2024',
      status: 'Open',
    },
    {
      name: 'Engineering Excellence Award',
      amount: 40000,
      eligibility: 'Engineering students, 3rd or 4th year',
      deadline: '10 Jun 2024',
      status: 'Closed',
    },
    {
      name: 'Girl Child Education Support',
      amount: 15000,
      eligibility: 'Female students, classes 8 to 12',
      deadline: '20 Sep 2024',
      status: 'Open',
    },
    {
      name: 'PU College Assistance',
      amount: 8000,
      eligibility: 'PUC first and second year students',
      deadline: '05 May 2024',
      status: 'Closed',
    },
    {
      name: 'Postgraduate Research Grant',
      amount: 50000,
      eligibility: 'Postgraduate students pursuing research',
      deadline: '28 Sep 2024',
      status: 'Open',
    },
  ];

  ngOnInit(): void {
    setTimeout(() => (this.loading = false), 600);
  }
}
