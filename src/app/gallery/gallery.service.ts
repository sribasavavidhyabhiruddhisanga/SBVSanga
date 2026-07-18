import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../core/api-base';

/** Row shape sent to / received from the gallery-images API. Each `key` points at an object in the media S3 bucket. */
export interface GalleryImage {
  id: string;
  key: string;
  title: string;
  category: string;
  date: string;
}

function normalizeImage(record: Partial<GalleryImage>): GalleryImage {
  return {
    id: record.id ?? '',
    key: record.key ?? '',
    title: record.title ?? '',
    category: record.category ?? '',
    date: record.date ?? '',
  };
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly resourceUrl = `${API_BASE_URL}/data/gallery_images.json`;

  constructor(private http: HttpClient) {}

  getImages(): Observable<GalleryImage[]> {
    return this.http.get<GalleryImage[] | GalleryImage | null>(this.resourceUrl).pipe(
      map((body) => {
        const records = Array.isArray(body) ? body : body ? [body] : [];
        return records.map(normalizeImage);
      }),
    );
  }

  /**
   * Posts the FULL image list (existing + new), not just the new record — the live
   * `/data/*.json` endpoints overwrite the whole file with the POST body rather than appending.
   */
  createImage(images: GalleryImage[]): Observable<GalleryImage[]> {
    return this.http.post<GalleryImage[]>(this.resourceUrl, images);
  }

  /** Next sequential "IMGxxx" id, derived from the highest numeric suffix already on record. */
  nextImageId(existing: GalleryImage[]): string {
    const highest = existing.reduce((max, record) => {
      const match = /^IMG(\d+)$/.exec(record.id ?? '');
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);

    return `IMG${String(highest + 1).padStart(3, '0')}`;
  }
}
