import { HttpErrorResponse } from '@angular/common/http';

/**
 * Pulls a human-readable message out of a failed HttpClient response so the Toaster can
 * show what the API actually said (payload `message`/`error`/`errorMessage` fields) instead
 * of a generic "Http failure response for ..." string.
 */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const payload = error.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const message = payload.message ?? payload.error ?? payload.errorMessage;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }

    if (error.message) {
      return error.message;
    }
  }

  return fallback;
}
