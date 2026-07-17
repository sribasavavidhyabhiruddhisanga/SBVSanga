import { Injectable, signal } from '@angular/core';

export type AppLanguage = 'kn' | 'en';

/**
 * Dashboard-only language toggle. Deliberately not wired to any other page — the whole
 * point is that switching language here has zero effect anywhere else in the app.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly languageSignal = signal<AppLanguage>('kn');
  readonly language = this.languageSignal.asReadonly();

  toggle(): void {
    this.languageSignal.update((current) => (current === 'kn' ? 'en' : 'kn'));
  }

  set(language: AppLanguage): void {
    this.languageSignal.set(language);
  }

  /** Back to the default (Kannada) — called every time the Dashboard is (re)entered. */
  reset(): void {
    this.languageSignal.set('kn');
  }
}
