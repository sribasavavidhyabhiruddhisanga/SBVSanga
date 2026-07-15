import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  templateUrl: './hero-banner.component.html',
})
export class HeroBannerComponent {
  @Input({ required: true }) eyebrow!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) subtitle!: string;
}
