import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'b2u-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  /*templateUrl: './app.html',
  styleUrl: './app.scss'*/
})
export class App {
  protected readonly title = signal('b2u-hub');
}
