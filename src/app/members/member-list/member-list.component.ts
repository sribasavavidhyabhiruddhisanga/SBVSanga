import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, catchError, combineLatest, map, of, startWith } from 'rxjs';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { DataTableColumn, DataTableComponent } from '../../shared/data-table/data-table.component';
import { MemberRecord, MemberService } from '../member.service';

type StatusFilter = 'All' | 'Active' | 'Inactive';

interface MemberListViewModel {
  loading: boolean;
  error: boolean;
  members: MemberRecord[];
}

/**
 * This app runs zoneless, so the member list is built the same way as Scholarship List:
 * a single `vm$` consumed via the `async` pipe instead of a bare `.subscribe()` mutating
 * plain fields. The status filter is folded into the same `combineLatest` (via a
 * BehaviorSubject) rather than filtered inline in the template — an inline
 * `members.filter(...)` call re-runs (and allocates a new array) on every unrelated change
 * detection pass, which would otherwise silently reset the table's pagination back to page 1.
 */
@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, DataTableComponent],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent {
  private readonly memberService = inject(MemberService);
  private readonly statusFilterSubject = new BehaviorSubject<StatusFilter>('All');

  get statusFilter(): StatusFilter {
    return this.statusFilterSubject.value;
  }

  set statusFilter(value: StatusFilter) {
    this.statusFilterSubject.next(value);
  }

  readonly columns: DataTableColumn[] = [
    { header: 'Member', key: 'name' },
    { header: 'Member ID', key: 'memberId' },
    { header: 'Address', key: 'address' },
    {
      header: 'Status',
      key: 'status',
      type: 'badge',
      badgeClassMap: {
        Active: 'bg-emerald-50 text-emerald-700',
        Inactive: 'bg-stone-100 text-stone-500',
      },
    },
  ];

  private readonly members$: Observable<MemberRecord[] | 'error'> = this.memberService.getMembers().pipe(
    catchError(() => of<'error'>('error')),
  );

  readonly vm$: Observable<MemberListViewModel> = combineLatest([
    this.members$.pipe(startWith(undefined)),
    this.statusFilterSubject,
  ]).pipe(
    map(([members, statusFilter]): MemberListViewModel => {
      if (members === undefined) {
        return { loading: true, error: false, members: [] };
      }
      if (members === 'error') {
        return { loading: false, error: true, members: [] };
      }

      const filtered =
        statusFilter === 'All' ? members : members.filter((member) => member.status === statusFilter);

      return { loading: false, error: false, members: filtered };
    }),
  );
}
