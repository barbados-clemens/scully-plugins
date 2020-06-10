import { NgModule } from '@angular/core';
import { BlurUpDirective } from './blur-up.directive';

@NgModule({
  declarations: [
    BlurUpDirective
  ],
  exports: [
    BlurUpDirective
  ]
})
export class BlurUpModule {

}
