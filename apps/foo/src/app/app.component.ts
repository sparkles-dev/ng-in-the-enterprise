import { Component } from '@angular/core';
import { CORE } from '@enterprise/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = CORE;
}
