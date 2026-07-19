import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { toIsoDate } from '../../core/date.util';
import { MediaService } from '../../core/media.service';
import { GalleryImage, GalleryService } from '../gallery.service';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * This app runs zoneless, so state mutated inside HTTP `.subscribe()` callbacks never reaches
 * the DOM on its own — `cdr.markForCheck()` is called after every state mutation below, same
 * pattern as the other admin forms in this codebase.
 */
@Component({
  selector: 'app-gallery-manage',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, PageHeaderComponent],
  templateUrl: './gallery-manage.component.html',
})
export class GalleryManageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly galleryService = inject(GalleryService);
  private readonly mediaService = inject(MediaService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  submitting = false;
  selectedFiles: File[] = [];

  readonly categories = ['Meetings', 'Scholarships', 'Community', 'Cultural'];
  readonly minDate = toIsoDate(new Date());

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    date: [this.minDate, Validators.required],
  });

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];

    if (files.length === 0) {
      this.selectedFiles = [];
      return;
    }

    const valid: File[] = [];
    let anyRejected = false;

    for (const file of files) {
      const extension = `.${(file.name.split('.').pop() ?? '').toLowerCase()}`;

      if (!ALLOWED_EXTENSIONS.includes(extension) || file.size > MAX_FILE_SIZE_BYTES) {
        anyRejected = true;
        continue;
      }

      valid.push(file);
    }

    if (anyRejected) {
      this.toastService.show(
        'Some files were skipped — only JPG, JPEG, PNG, or WEBP under 5MB are allowed.',
        'error',
      );
    }

    this.selectedFiles = valid;
  }

  uploadImages(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.toastService.show('Please choose at least one photo to upload.', 'error');
      return;
    }

    this.submitting = true;
    const formValue = this.form.getRawValue();

    forkJoin(this.selectedFiles.map((file) => this.mediaService.uploadFile(file))).subscribe({
      next: (uploads) => {
        this.galleryService
          .getImages()
          .pipe(
            switchMap((existing) => {
              let working = existing;
              const newRecords: GalleryImage[] = uploads.map(({ key }) => {
                const record: GalleryImage = {
                  id: this.galleryService.nextImageId(working),
                  key,
                  title: formValue.title,
                  category: formValue.category,
                  date: formValue.date,
                };
                working = [...working, record];
                return record;
              });
              return this.galleryService.createImage(working);
            }),
          )
          .subscribe({
            next: () => {
              this.submitting = false;
              const count = uploads.length;
              this.toastService.show(`${count} photo${count > 1 ? 's' : ''} added to the gallery.`, 'success');
              this.form.reset({ title: '', category: '', date: this.minDate });
              this.selectedFiles = [];
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.submitting = false;
              this.toastService.show(
                extractApiErrorMessage(error, 'Could not save the photos. Please try again.'),
                'error',
              );
              this.cdr.markForCheck();
            },
          });
      },
      error: (error) => {
        this.submitting = false;
        this.toastService.show(
          extractApiErrorMessage(error, 'Could not upload the photos. Please try again.'),
          'error',
        );
        this.cdr.markForCheck();
      },
    });
  }
}
