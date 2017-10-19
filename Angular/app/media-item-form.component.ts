import { Component, Inject } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';

import { MediaItemService } from './media-item.service';
import { lookupListToken } from './providers';

@Component({
  selector: 'mw-media-item-form',
  templateUrl: 'app/media-item-form.component.html',
  styleUrls: ['app/media-item-form.component.css']
})
export class MediaItemFormComponent {
  form;

  constructor(
    private formBuilder: FormBuilder,
    private mediaItemService: MediaItemService,
    @Inject(lookupListToken) public lookupLists) {

  }

  ngOnInit() {
    this.form = this.formBuilder.group({
      medium: this.formBuilder.control(this.lookupLists.mediums[0]),
      name: this.formBuilder.control('', Validators.compose([
        Validators.required,
        Validators.pattern('[\\w\\-\\s\\/\\:\\\'\\?]+')
      ])),
      category: this.formBuilder.control('Choose', Validators.required),
      year: this.formBuilder.control('', Validators.compose([
        Validators.required,
        this.yearValidator
      ]))
    });
  }

  yearValidator(control) {
    if (control.value.trim()
      .length === 0) {
      return null;
    }

    let year = parseInt(control.value);
    return (year <= 2100 && year >= 1900) ? null : {
      'year': {
        min: (year <= 2100),
        max: (year >= 1900)
      }
    };
  }

  onSubmit(mediaItem) {
    this.mediaItemService.add(mediaItem);
  }
}
