import {
  Injectable,
  ApplicationRef,
  EnvironmentInjector,
  ComponentRef,
  createComponent,
} from '@angular/core';
import { ConfirmComponent, ConfirmConfig } from './confirm.component';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(
    private appRef: ApplicationRef,
    private env: EnvironmentInjector,
  ) {}

  ask(cfg: ConfirmConfig): Promise<boolean> {
    // Defaults
    cfg = {
      title: 'Delete item?',
      message: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
      closeOnBackdrop: false,
      ...cfg,
    };

    // Create a host element under <body>
    const hostEl = document.createElement('div');
    document.body.appendChild(hostEl);

    // Create the component and attach to app
    const ref: ComponentRef<ConfirmComponent> = createComponent(ConfirmComponent, {
      environmentInjector: this.env,
      hostElement: hostEl,
    });

    ref.instance.cfg = cfg;
    this.appRef.attachView(ref.hostView);

    // Return a Promise<boolean> and clean up on close
    return new Promise<boolean>((resolve) => {
      const done = (v: boolean) => {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        hostEl.remove();
        resolve(v);
      };

      const sub = ref.instance.closed.subscribe(v => {
        sub.unsubscribe();
        done(v);
      });
    });
  }
}
