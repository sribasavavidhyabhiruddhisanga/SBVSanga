import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

const DEFAULT_DURATION_MS = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);

  readonly toasts$ = this.toastsSubject.asObservable();

  show(text: string, type: ToastType = 'info', durationMs = DEFAULT_DURATION_MS): void {
    const toast: ToastMessage = { id: this.nextId++, text, type };
    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  dismiss(id: number): void {
    this.toastsSubject.next(this.toastsSubject.value.filter((toast) => toast.id !== id));
  }
}
