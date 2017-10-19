import { Component } from '@angular/core';


@Component({
  selector: 'vq-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  appName = 'Voltage Query';
}