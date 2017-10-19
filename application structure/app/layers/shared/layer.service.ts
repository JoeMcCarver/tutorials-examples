import { Injectable } from '@angular/core';

import { LAYERS } from './mock-layers';

@Injectable()
export class LayerService {
  getLayers() {
    return Promise.resolve(LAYERS);
  }
}