import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
