// shared/dialog-host.directive.ts
import { Directive, ViewContainerRef, inject } from '@angular/core';
import { ConfirmService } from '../confirm/confirm.service';

@Directive({
  selector: '[appDialogHost]',
  standalone: true,
})
export class DialogHostDirective {
  constructor() {
    // inject(ConfirmService).registerHost(inject(ViewContainerRef));
  }
}
