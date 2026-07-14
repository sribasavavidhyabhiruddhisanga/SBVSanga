import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DataTableColumn, DataTableComponent } from '../../shared/data-table/data-table.component';
import { ScholarshipRow, ScholarshipService } from '../scholarship.service';

interface ScholarshipListViewModel {
  loading: boolean;
  error: boolean;
  scholarships: ScholarshipRow[];
}

const LOADING_VM: ScholarshipListViewModel = { loading: true, error: false, scholarships: [] };

/**
 * This app runs zoneless (no zone.js), so an `HttpClient` response that lands via a bare
 * `.subscribe()` callback never notifies Angular's change detection scheduler on its own —
 * the table would stay on its skeleton until an unrelated click elsewhere forced a check.
 * Exposing a single `vm$` consumed via the `async` pipe fixes that natively: the pipe calls
 * `markForCheck()` for us on every emission, load, or failure.
 */
@Component({
  selector: 'app-scholarship-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './scholarship-list.component.html',
})
export class ScholarshipListComponent {
  private readonly scholarshipService = inject(ScholarshipService);

  readonly columns: DataTableColumn[] = [
    { header: 'Scholarship', key: 'studentName', secondaryKey: 'email', type: 'two-line' },
    { header: 'Parent and Occupation', key: 'parentAndOccupation' },
    { header: 'Address', key: 'address' },
    { header: 'Phone Number', key: 'phoneNumber' },
  ];

  readonly vm$: Observable<ScholarshipListViewModel> = this.scholarshipService.getScholarships().pipe(
    map((scholarships): ScholarshipListViewModel => ({ loading: false, error: false, scholarships })),
    startWith(LOADING_VM),
    catchError(() => of<ScholarshipListViewModel>({ loading: false, error: true, scholarships: [] })),
  );
}
