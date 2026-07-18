import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';
import { ToastService } from '../core/toast.service';
import { extractApiErrorMessage } from '../core/api-error.util';
import { MediaService } from '../core/media.service';
import { GalleryImage, GalleryService } from './gallery.service';

interface GalleryTile extends GalleryImage {
  url: string;
}

/**
 * This app runs zoneless, so state mutated inside the HTTP `.subscribe()` callback below never
 * reaches the DOM on its own — `cdr.markForCheck()` is called after the roster + resolved photo
 * URLs are loaded, same pattern as the other simple one-shot loads in this codebase.
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

  readonly albumUrl = 'https://photos.app.goo.gl/FMFnzLZYMjBaDgQM8';

  loading = true;
  error = false;
  activeCategory = 'All';
  tiles: GalleryTile[] = [];
  categories: string[] = ['All'];

  ngOnInit(): void {
    this.galleryService
      .getImages()
      .pipe(
        switchMap((images) => {
          if (images.length === 0) {
            return of<GalleryTile[]>([]);
          }

          return forkJoin(
            images.map((image) =>
              this.mediaService.getDownloadUrl(image.key).pipe(
                map((url): GalleryTile | null => ({ ...image, url })),
                catchError(() => of(null)),
              ),
            ),
          ).pipe(map((results) => results.filter((tile): tile is GalleryTile => tile !== null)));
        }),
        catchError((httpError) => {
          this.toastService.show(extractApiErrorMessage(httpError, "Couldn't load the gallery right now."), 'error');
          this.error = true;
          return of<GalleryTile[]>([]);
        }),
      )
      .subscribe((tiles) => {
        this.loading = false;
        this.tiles = tiles;
        this.categories = ['All', ...new Set(tiles.map((tile) => tile.category).filter(Boolean))];
        this.cdr.markForCheck();
      });
  }

  get filteredTiles(): GalleryTile[] {
    return this.activeCategory === 'All'
      ? this.tiles
      : this.tiles.filter((tile) => tile.category === this.activeCategory);
  }

  setCategory(category: string): void {
    this.activeCategory = category;
  }
}
