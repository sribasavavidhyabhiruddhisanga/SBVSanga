import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { switchMap } from 'rxjs';
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
  selectedFile: File | null = null;

  readonly categories = ['Meetings', 'Scholarships', 'Community', 'Cultural'];
  readonly minDate = toIsoDate(new Date());

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['', Validators.required],
    date: [this.minDate, Validators.required],
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
      this.toastService.show('Only JPG, JPEG, PNG, or WEBP images are allowed.', 'error');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.toastService.show('Image is too large — the maximum allowed size is 5MB.', 'error');
      this.selectedFile = null;
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  uploadImage(): void {
    if (this.form.invalid || this.submitting) {
      return;
    }

    if (!this.selectedFile) {
      this.toastService.show('Please choose a photo to upload.', 'error');
      return;
    }

    this.submitting = true;
    const formValue = this.form.getRawValue();

    this.mediaService.uploadFile(this.selectedFile).subscribe({
      next: ({ key }) => {
        this.galleryService
          .getImages()
          .pipe(
            switchMap((existing) => {
              const payload: GalleryImage = {
                id: this.galleryService.nextImageId(existing),
                key,
                title: formValue.title,
                category: formValue.category,
                date: formValue.date,
              };
              return this.galleryService.createImage([...existing, payload]);
            }),
          )
          .subscribe({
            next: () => {
              this.submitting = false;
              this.toastService.show('Photo added to the gallery.', 'success');
              this.form.reset({ title: '', category: '', date: this.minDate });
              this.selectedFile = null;
              this.cdr.markForCheck();
            },
            error: (error) => {
              this.submitting = false;
              this.toastService.show(
                extractApiErrorMessage(error, 'Could not save the photo. Please try again.'),
                'error',
              );
              this.cdr.markForCheck();
            },
          });
      },
      error: (error) => {
        this.submitting = false;
        this.toastService.show(
          extractApiErrorMessage(error, 'Could not upload the photo. Please try again.'),
          'error',
        );
        this.cdr.markForCheck();
      },
    });
  }
}
