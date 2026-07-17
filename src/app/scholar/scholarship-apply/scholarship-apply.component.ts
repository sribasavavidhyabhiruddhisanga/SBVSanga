import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { toIsoDate } from '../../core/date.util';
import { MediaService } from '../../core/media.service';
import { ScholarshipApplication, ScholarshipReceivedService } from '../scholarship-received.service';

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

/**
 * This app runs zoneless, so state mutated inside HTTP `.subscribe()` callbacks never reaches
 * the DOM on its own — `cdr.markForCheck()` is called after every state mutation below, same
 * as the other forms in this codebase (see MemberRegisteredFormComponent).
 */
@Component({
  selector: 'app-scholarship-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent],
  templateUrl: './scholarship-apply.component.html',
})
export class ScholarshipApplyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly scholarshipReceivedService = inject(ScholarshipReceivedService);
  private readonly mediaService = inject(MediaService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitting = false;
  selectedFile: File | null = null;
  readonly allowedExtensions = ALLOWED_EXTENSIONS;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    emailId: ['', Validators.required],
    upiLinked_Phone: ['', Validators.required],
    address: ['', Validators.required],
    parentsName_occuptation: ['', Validators.required],
    'institution Name': ['', Validators.required],
    currentEducation: ['', Validators.required],
    percentage_marks: ['', Validators.required],
    accountHolderName: ['', Validators.required],
    bankName: ['', Validators.required],
    accountNumber: ['', Validators.required],
    ifscCode: ['', Validators.required],
    referredBy: ['', Validators.required],
    availedScholarship: ['', Validators.required],
    score: ['', Validators.required],
  });

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      this.selectedFile = null;
      return;
    }

    const extension = `.${(file.name.split('.').pop() ?? '').toLowerCase()}`;

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      this.toastService.show('Only JPG, JPEG, PNG, or PDF files are allowed.', 'error');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.toastService.show('File is too large — the maximum allowed size is 2MB.', 'error');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  submitApplication(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    if (!this.selectedFile) {
      this.toastService.show('Please attach a supporting document before submitting.', 'error');
      return;
    }

    this.submitting = true;
    const formValue = this.form.getRawValue();

    this.mediaService.uploadFile(this.selectedFile).subscribe({
      next: ({ uploadUrl, key }) => {
        this.scholarshipReceivedService
          .getApplications()
          .pipe(
            switchMap((existing) => {
              const payload: ScholarshipApplication = {
                ...formValue,
                id: this.scholarshipReceivedService.nextApplicationId(existing),
                timeStamp: toIsoDate(new Date()),
                status: 'Pending',
                docLink: { uploadUrl, key },
              };
              return this.scholarshipReceivedService.createApplication([...existing, payload]);
            }),
          )
          .subscribe({
            next: () => {
              this.submitting = false;
              this.toastService.show('Scholarship application submitted successfully.', 'success');
              this.form.reset();
              this.selectedFile = null;
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.submitting = false;
              this.toastService.show(
                extractApiErrorMessage(error, 'Could not submit the application. Please try again.'),
                'error',
              );
              this.cdr.markForCheck();
            },
          });
      },
      error: (error) => {
        this.submitting = false;
        this.toastService.show(
          extractApiErrorMessage(error, 'Could not upload the document. Please try again.'),
          'error',
        );
        this.cdr.markForCheck();
      },
    });
  }
}
