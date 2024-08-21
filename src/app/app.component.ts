import { Component } from '@angular/core';
import { EncoderComponent } from './encoder/encoder.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EncoderComponent],
  template: `<app-encoder></app-encoder>`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
