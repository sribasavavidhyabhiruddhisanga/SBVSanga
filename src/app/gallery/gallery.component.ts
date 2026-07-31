import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { ToastService } from '../core/toast.service';
import { extractApiErrorMessage } from '../core/api-error.util';
import { MediaService } from '../core/media.service';
import { GalleryImage, GalleryService } from './gallery.service';

interface GalleryTile extends GalleryImage {
  url: string;
}

/** One Google Photos album per year — shown as a secondary link alongside whichever year is active. */
const ALBUM_LINKS: Record<string, string> = {
  '2025': 'https://photos.app.goo.gl/FMFnzLZYMjBaDgQM8',
  '2026': 'https://photos.app.goo.gl/BQdw2utNAP9L2X9G9',
};

const CATEGORIES = ['2025', '2026'];

/**
 * This app runs zoneless, so state mutated inside HTTP `.subscribe()` callbacks never reaches
 * the DOM on its own — `cdr.markForCheck()` is called after every state mutation below.
 *
 * Photo URLs are resolved per-category rather than all at once: each photo needs its own
 * `/media/download-url` call, and resolving every year's photos up front fires them all
 * simultaneously regardless of which year is actually being viewed — the likely cause of the
 * intermittent 503s seen earlier. Only the active year's photos are resolved, and switching
 * years re-resolves just that year's subset.
 */
@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent implements OnInit {
  private readonly galleryService = inject(GalleryService);
  private readonly mediaService = inject(MediaService);
  private readonly toastService = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly categories = CATEGORIES;

  loading = true;
  error = false;
  tilesLoading = false;
  activeCategory = CATEGORIES[CATEGORIES.length - 1];
  tiles: GalleryTile[] = [];

  private allImages: GalleryImage[] = [];

  get albumUrl(): string {
    return ALBUM_LINKS[this.activeCategory] ?? Object.values(ALBUM_LINKS)[0];
  }

  ngOnInit(): void {
    const currentYear = String(new Date().getFullYear());
    this.activeCategory = this.categories.includes(currentYear)
      ? currentYear
      : this.categories[this.categories.length - 1];

    this.galleryService
      .getImages()
      .pipe(
        catchError((httpError) => {
          this.toastService.show(extractApiErrorMessage(httpError, "Couldn't load the gallery right now."), 'error');
          this.error = true;
          return of<GalleryImage[]>([]);
        }),
      )
      .subscribe((images) => {
        this.allImages = images;
        this.loading = false;
        this.cdr.markForCheck();
        if (!this.error) {
          this.loadCategory(this.activeCategory);
        }
      });
  }

  setCategory(category: string): void {
    if (category === this.activeCategory || this.tilesLoading) {
      return;
    }
    this.activeCategory = category;
    this.loadCategory(category);
  }

  private loadCategory(category: string): void {
    const matching = this.allImages.filter((image) => image.category === category);

    if (matching.length === 0) {
      this.tiles = [];
      this.cdr.markForCheck();
      return;
    }

    this.tilesLoading = true;
    this.cdr.markForCheck();

    forkJoin(
      matching.map((image) =>
        this.mediaService.getDownloadUrl(image.key).pipe(
          map((url): GalleryTile | null => ({ ...image, url })),
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((results) => {
      this.tilesLoading = false;
      this.tiles = results.filter((tile): tile is GalleryTile => tile !== null);
      this.cdr.markForCheck();
    });
  }
}
