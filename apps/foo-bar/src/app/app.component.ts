import { Component } from '@angular/core';
import { FRAMEWORK } from '@enterprise/framework';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = FRAMEWORK;
}
