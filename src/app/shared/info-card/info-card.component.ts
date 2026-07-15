import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-card',
  standalone: true,
  templateUrl: './info-card.component.html',
})
export class InfoCardComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
}
