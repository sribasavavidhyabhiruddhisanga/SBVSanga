import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-card',
  standalone: true,
  templateUrl: './profile-card.component.html',
})
export class ProfileCardComponent {
  @Input({ required: true }) image!: string;
  @Input({ required: true }) alt!: string;
  @Input({ required: true }) description!: string;
  @Input() imagePosition: 'left' | 'right' = 'left';
}
