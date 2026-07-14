import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../shared/page-header/page-header.component';

interface GalleryItem {
  title: string;
  category: string;
  date: string;
  colorFrom: string;
  colorTo: string;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  templateUrl: './gallery.component.html',
})
export class GalleryComponent implements OnInit {
  loading = true;
  activeCategory = 'All';

  readonly categories = ['All', 'Meetings', 'Scholarships', 'Community', 'Cultural'];

  readonly items: GalleryItem[] = [
    { title: 'Annual General Meeting', category: 'Meetings', date: '15 Jan 2024', colorFrom: 'from-orange-400', colorTo: 'to-amber-600' },
    { title: 'Scholarship Distribution', category: 'Scholarships', date: '20 Feb 2024', colorFrom: 'from-amber-400', colorTo: 'to-orange-600' },
    { title: 'Community Gathering', category: 'Community', date: '05 Mar 2024', colorFrom: 'from-stone-400', colorTo: 'to-stone-700' },
    { title: 'Cultural Program', category: 'Cultural', date: '18 Apr 2024', colorFrom: 'from-orange-500', colorTo: 'to-red-600' },
    { title: 'Donor Appreciation Event', category: 'Community', date: '02 May 2024', colorFrom: 'from-amber-500', colorTo: 'to-stone-700' },
    { title: 'Educational Seminar', category: 'Meetings', date: '22 Jun 2024', colorFrom: 'from-orange-400', colorTo: 'to-stone-600' },
    { title: 'Scholarship Awareness Camp', category: 'Scholarships', date: '10 Jul 2024', colorFrom: 'from-amber-400', colorTo: 'to-orange-500' },
    { title: 'Health Check-up Camp', category: 'Community', date: '30 Jul 2024', colorFrom: 'from-stone-500', colorTo: 'to-orange-600' },
  ];

  ngOnInit(): void {
    setTimeout(() => (this.loading = false), 600);
  }

  get filteredItems(): GalleryItem[] {
    return this.activeCategory === 'All'
      ? this.items
      : this.items.filter((item) => item.category === this.activeCategory);
  }

  setCategory(category: string): void {
    this.activeCategory = category;
  }
}
