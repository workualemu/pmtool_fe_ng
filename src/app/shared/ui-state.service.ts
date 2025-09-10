import { Injectable, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private doc = inject(DOCUMENT);

  isSidebarOpen = signal(false);
  isHeaderBlur = signal(false);
  hasMinSidebar = signal(false);
  headerSticky = signal(true);

  constructor() {
    effect(() => {
      const b = this.doc.body.classList;
      b.toggle('is-sidebar-open', this.isSidebarOpen());
      b.toggle('is-header-blur', this.isHeaderBlur());
      b.toggle('has-min-sidebar', this.hasMinSidebar());
      b.toggle('is-header-not-sticky', !this.headerSticky());
    });
  }
}
