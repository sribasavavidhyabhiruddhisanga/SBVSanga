import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DataTableColumn, DataTableComponent } from '../../shared/data-table/data-table.component';
import { DonorRecord, DonorService } from '../donor.service';

interface DonorListViewModel {
  loading: boolean;
  error: boolean;
  donors: DonorRecord[];
}

const LOADING_VM: DonorListViewModel = { loading: true, error: false, donors: [] };

/**
 * This app runs zoneless, so the donor list is built the same way as Scholarship List:
 * a single `vm$` consumed via the `async` pipe instead of a bare `.subscribe()` mutating
 * plain fields, so the table always renders as soon as the API responds — no click needed.
 */
@Component({
  selector: 'app-donor-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './donor-list.component.html',
})
export class DonorListComponent {
  private readonly donorService = inject(DonorService);

  readonly columns: DataTableColumn[] = [
    { header: 'Donor', key: 'name' },
    { header: 'Donor ID', key: 'donarId' },
    { header: 'Address', key: 'address' },
  ];

  readonly vm$: Observable<DonorListViewModel> = this.donorService.getDonors().pipe(
    map((donors): DonorListViewModel => ({ loading: false, error: false, donors })),
    startWith(LOADING_VM),
    catchError(() => of<DonorListViewModel>({ loading: false, error: true, donors: [] })),
  );
}
