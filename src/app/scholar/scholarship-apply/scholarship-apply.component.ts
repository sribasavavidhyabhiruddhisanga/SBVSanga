import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

@Component({
  selector: 'app-scholarship-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './scholarship-apply.component.html',
})
export class ScholarshipApplyComponent implements OnInit {
  submitting = false;
  submitted = false;

  readonly scholarshipOptions = [
    'Merit Scholarship for SSLC Toppers',
    'Undergraduate Support Grant',
    'Engineering Excellence Award',
    'Girl Child Education Support',
    'PU College Assistance',
    'Postgraduate Research Grant',
  ];

  form = {
    applicantName: '',
    email: '',
    phone: '',
    course: '',
    scholarship: '',
    amountRequested: null as number | null,
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const scholarship = this.route.snapshot.queryParamMap.get('scholarship');

    if (scholarship) {
      this.form.scholarship = scholarship;
    }
  }

  submitApplication(): void {
    if (!this.form.applicantName || !this.form.email || !this.form.scholarship) {
      return;
    }

    this.submitting = true;

    setTimeout(() => {
      this.submitting = false;
      this.submitted = true;
      this.form = { applicantName: '', email: '', phone: '', course: '', scholarship: '', amountRequested: null };
    }, 700);
  }
}
