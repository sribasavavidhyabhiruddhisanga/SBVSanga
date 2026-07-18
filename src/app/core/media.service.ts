import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { API_BASE_URL } from './api-base';

interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}

interface DownloadUrlResponse {
  downloadUrl: string;
}

@Injectable({ providedIn: 'root' })
export class MediaService {
  private readonly mediaUrl = `${API_BASE_URL}/media`;

  constructor(private http: HttpClient) {}

  /**
   * Uploads a file straight to S3 via a presigned URL; resolves to the upload URL and S3 key.
   * Note: the `uploadUrl` is only valid for the ~5 minute window S3 presigned it for, and is
   * signed for a PUT, not a GET — it cannot be reused later to view/download the file. Store
   * `key` for that; re-derive a fresh URL via `getDownloadUrl()` whenever the file needs to be
   * opened or downloaded again.
   */
  uploadFile(file: File): Observable<UploadUrlResponse> {
    return this.http
      .get<UploadUrlResponse>(`${this.mediaUrl}/upload-url`, {
        params: { fileName: file.name, contentType: file.type || 'application/octet-stream' },
      })
      .pipe(
        switchMap((response) =>
          this.http
            .put(response.uploadUrl, file, {
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
            })
            .pipe(map(() => response)),
        ),
      );
  }

  /** Resolves a stored S3 key to a short-lived, directly-downloadable URL. */
  getDownloadUrl(key: string): Observable<string> {
    return this.http
      .get<DownloadUrlResponse>(`${this.mediaUrl}/download-url`, { params: { key } })
      .pipe(map((response) => response.downloadUrl));
  }

  /**
   * Fetches a stored S3 object as a Blob via a fresh presigned URL. A plain `<a download>` only
   * forces a "Save As" for same-origin URLs — since S3 is a different origin, browsers ignore
   * the `download` attribute there and just navigate to it. Fetching the bytes first lets the
   * caller build a same-origin `blob:` URL that a real download link will honor.
   */
  downloadFile(key: string): Observable<Blob> {
    return this.getDownloadUrl(key).pipe(switchMap((url) => this.http.get(url, { responseType: 'blob' })));
  }
}
