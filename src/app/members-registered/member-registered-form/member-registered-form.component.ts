import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { MemberRegisteredRecord, MemberRegisteredService } from '../member-registered.service';

/**
 * Add Member workspace view. This app runs zoneless, so state mutated inside the HTTP
 * `.subscribe()` callback below never reaches the DOM on its own — `cdr.markForCheck()`
 * is called after mutating component state in both the success and error branches.
 */
@Component({
  selector: 'app-member-registered-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PageHeaderComponent],
  templateUrl: './member-registered-form.component.html',
})
export class MemberRegisteredFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly memberRegisteredService = inject(MemberRegisteredService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  submitting = false;

  readonly minDate = this.toIsoDate(new Date());

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    emailId: ['', Validators.required],
    phone: ['', Validators.required],
    referredBy: ['', Validators.required],
    date: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const formValue = this.form.getRawValue();

    this.memberRegisteredService
      .getMembers()
      .pipe(
        switchMap((existing) => {
          const payload: MemberRegisteredRecord = {
            ...formValue,
            memberId: this.memberRegisteredService.nextMemberId(existing),
            status: 'Active',
          };
          return this.memberRegisteredService.createMember([...existing, payload]);
        }),
      )
      .subscribe({
        next: () => {
          this.submitting = false;
          this.toastService.show('Update a new member success', 'success');
          this.form.reset();
          this.router.navigateByUrl('/updates/members-registered');
          this.cdr.markForCheck();
        },
        error: (error) => {
          this.submitting = false;
          this.toastService.show(
            extractApiErrorMessage(error, 'Could not add member. Please try again.'),
            'error',
          );
          this.cdr.markForCheck();
        },
      });
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
