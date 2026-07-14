import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  joinedOn: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-member-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent],
  templateUrl: './member-list.component.html',
})
export class MemberListComponent implements OnInit {
  loading = true;
  searchTerm = '';
  statusFilter: 'All' | 'Active' | 'Inactive' = 'All';

  readonly members: Member[] = [
    { id: 'MEM-1042', name: 'Ramesh Kulkarni', phone: '+91 98765 43210', email: 'ramesh.kulkarni@example.com', joinedOn: '12 Jan 2024', status: 'Active' },
    { id: 'MEM-1043', name: 'Suresh Patil', phone: '+91 98450 11223', email: 'suresh.patil@example.com', joinedOn: '03 Feb 2024', status: 'Active' },
    { id: 'MEM-1044', name: 'Lakshmi Hegde', phone: '+91 97401 55667', email: 'lakshmi.hegde@example.com', joinedOn: '21 Feb 2024', status: 'Active' },
    { id: 'MEM-1045', name: 'Anitha Desai', phone: '+91 96204 33221', email: 'anitha.desai@example.com', joinedOn: '02 Mar 2024', status: 'Inactive' },
    { id: 'MEM-1046', name: 'Vijay Kumbhar', phone: '+91 99001 22334', email: 'vijay.kumbhar@example.com', joinedOn: '18 Mar 2024', status: 'Active' },
    { id: 'MEM-1047', name: 'Prakash Naik', phone: '+91 98230 99887', email: 'prakash.naik@example.com', joinedOn: '05 Apr 2024', status: 'Inactive' },
    { id: 'MEM-1048', name: 'Manjula Rao', phone: '+91 90080 11556', email: 'manjula.rao@example.com', joinedOn: '27 Apr 2024', status: 'Active' },
    { id: 'MEM-1049', name: 'Ganesh Bhat', phone: '+91 93412 66778', email: 'ganesh.bhat@example.com', joinedOn: '09 May 2024', status: 'Active' },
  ];

  ngOnInit(): void {
    setTimeout(() => (this.loading = false), 600);
  }

  get filteredMembers(): Member[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.members.filter((member) => {
      const matchesSearch =
        !term || member.name.toLowerCase().includes(term) || member.email.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'All' || member.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }
}
