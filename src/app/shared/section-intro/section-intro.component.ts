import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-section-intro',
  standalone: true,
  templateUrl: './section-intro.component.html',
})
export class SectionIntroComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
}
