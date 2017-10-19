import { Component, OnInit } from '@angular/core';

import { Layer, LayerService } from './shared';

@Component({
  selector: 'vq-layers',
  template: `
      <pre>{{layers | json}}</pre>
    `
})
export class LayersComponent implements OnInit {
  layers: Layer[] = [];

  constructor(private layerService: LayerService) {}

  ngOnInit() {
    this.layerService.getLayers()
      .then(layers => this.layers = layers);
  }
}