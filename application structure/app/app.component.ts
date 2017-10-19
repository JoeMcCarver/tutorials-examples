import { Component } from '@angular/core';

import { LayerService } from './layers';

@Component({
  selector: 'vq-app',
  template: `
      <vq-layers></vq-layers>
    `,
  styleUrls: ['./app.component.css'],
  providers: [ LayerService ]
})
export class AppComponent { }