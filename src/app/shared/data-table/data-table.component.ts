import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  startWith,
} from 'rxjs';

export type DataTableColumnType = 'text' | 'two-line' | 'badge' | 'currency';

export interface DataTableColumn {
  header: string;
  key: string;
  secondaryKey?: string;
  type?: DataTableColumnType;
  /** Maps a cell's raw value to extra pill classes, only used when type === 'badge'. */
  badgeClassMap?: Record<string, string>;
}

export type PageWindowItem = number | 'ellipsis';

export interface DataTableViewModel {
  paged: Record<string, any>[];
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  pageWindow: PageWindowItem[];
}

const MAX_PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 300;

/**
 * Builds a compact page list (first/last + neighbors of the current page, collapsing
 * the rest into a single ellipsis marker) instead of one button per page — with API
 * datasets that can run 300+ records / 30+ pages, listing every page number is unusable.
 */
function buildPageWindow(current: number, total: number): PageWindowItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const keep = new Set([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...keep].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);

  const window: PageWindowItem[] = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) {
      window.push('ellipsis');
    }
    window.push(page);
    previous = page;
  }

  return window;
}

/**
 * Reusable search + paginated table shell shared by the Member, Donor and Scholarship lists.
 *
 * This app runs zoneless (no zone.js patching), so plain RxJS subscriptions that mutate
 * component fields directly never notify Angular's change detection scheduler on their own —
 * the view only catches up on the next unrelated DOM event. Every stream here is instead
 * composed into a single `vm$` observable consumed via the `async` pipe in the template,
 * which calls `markForCheck()` internally on each emission and keeps the view in sync.
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './data-table.component.html',
})
export class DataTableComponent {
  @Input() columns: DataTableColumn[] = [];
  @Input() searchKeys: string[] = [];
  @Input() loading = false;
  @Input() searchPlaceholder = 'Search by name or email';
  @Input() emptyMessage = 'No records match your search.';
  @Input() pageSize = MAX_PAGE_SIZE;

  @Input()
  set data(value: Record<string, any>[]) {
    this.dataSubject.next(value ?? []);
  }

  readonly searchControl = new FormControl('', { nonNullable: true });

  private readonly dataSubject = new BehaviorSubject<Record<string, any>[]>([]);
  private readonly pageRequest$ = new Subject<number>();

  private readonly searchTerm$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(SEARCH_DEBOUNCE_MS),
    distinctUntilChanged(),
    map((term) => term.trim().toLowerCase()),
  );

  private readonly filteredData$: Observable<Record<string, any>[]> = combineLatest([
    this.dataSubject,
    this.searchTerm$,
  ]).pipe(
    map(([data, term]) => {
      const keys = this.searchKeys.length ? this.searchKeys : this.columns.map((column) => column.key);

      return !term
        ? data
        : data.filter((row) => keys.some((key) => String(row[key] ?? '').toLowerCase().includes(term)));
    }),
  );

  // Any new search term or a fresh data set jumps back to page 1; explicit clicks drive it after that.
  private readonly requestedPage$ = merge(
    this.searchTerm$.pipe(map(() => 1)),
    this.dataSubject.pipe(map(() => 1)),
    this.pageRequest$,
  ).pipe(startWith(1));

  readonly vm$: Observable<DataTableViewModel> = combineLatest([this.filteredData$, this.requestedPage$]).pipe(
    map(([filtered, requestedPage]) => {
      const pageSize = Math.min(this.pageSize || MAX_PAGE_SIZE, MAX_PAGE_SIZE);
      const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
      const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
      const start = (currentPage - 1) * pageSize;

      return {
        paged: filtered.slice(start, start + pageSize),
        filteredCount: filtered.length,
        currentPage,
        totalPages,
        pageWindow: buildPageWindow(currentPage, totalPages),
      };
    }),
  );

  get skeletonRows(): number[] {
    return Array.from({ length: Math.min(this.pageSize, 5) }, (_, index) => index);
  }

  goToPage(page: number): void {
    this.pageRequest$.next(page);
  }
}
