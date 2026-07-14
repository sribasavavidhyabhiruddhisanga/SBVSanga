import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
}
