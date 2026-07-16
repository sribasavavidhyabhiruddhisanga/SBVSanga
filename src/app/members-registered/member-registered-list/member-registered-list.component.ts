import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, startWith } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DataTableColumn, DataTableComponent } from '../../shared/data-table/data-table.component';
import { ToastService } from '../../core/toast.service';
import { extractApiErrorMessage } from '../../core/api-error.util';
import { MemberRegisteredRecord, MemberRegisteredService } from '../member-registered.service';

interface MemberRegisteredViewModel {
  loading: boolean;
  error: boolean;
  members: MemberRegisteredRecord[];
}

/**
 * This app runs zoneless, so — same as Member List — the roster is built from a single
 * `vm$` consumed via the `async` pipe rather than a bare `.subscribe()` mutating plain fields.
 */
@Component({
  selector: 'app-member-registered-list',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './member-registered-list.component.html',
})
export class MemberRegisteredListComponent {
  private readonly memberRegisteredService = inject(MemberRegisteredService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly columns: DataTableColumn[] = [
    { header: 'Member', key: 'name', type: 'two-line', secondaryKey: 'emailId' },
    { header: 'Member ID', key: 'memberId' },
    { header: 'Address', key: 'address' },
    { header: 'Phone', key: 'phone' },
    { header: 'Referred By', key: 'referredBy' },
  ];

  private readonly members$: Observable<MemberRegisteredRecord[] | 'error'> = this.memberRegisteredService
    .getMembers()
    .pipe(
      catchError((error) => {
        this.toastService.show(
          extractApiErrorMessage(error, "Couldn't load registered members right now."),
          'error',
        );
        return of<'error'>('error');
      }),
    );

  readonly vm$: Observable<MemberRegisteredViewModel> = this.members$.pipe(
    startWith(undefined),
    map((members): MemberRegisteredViewModel => {
      if (members === undefined) {
        return { loading: true, error: false, members: [] };
      }
      if (members === 'error') {
        return { loading: false, error: true, members: [] };
      }

      return { loading: false, error: false, members };
    }),
  );

  goToAddMember(): void {
    this.router.navigateByUrl('/updates/members-registered/add');
  }
}
