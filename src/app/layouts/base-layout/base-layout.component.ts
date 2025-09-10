import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { UiStateService } from '../../shared/ui-state.service';

@Component({
  selector: 'app-base-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './base-layout.component.html',
})
export class BaseLayoutComponent {
  private ui = inject(UiStateService);
  showPreloader = signal(true);

  loading = signal(false);
  error = signal<string | null>(null);
  showTerms = signal(false);
  showPrivacy = signal(false);

  // You can pull this from an env or config if you prefer
  appName = 'Project Management System';

  ngAfterViewInit() {
    queueMicrotask(() => this.showPreloader.set(false));
  }

  toggleTerms() { this.showTerms.update(v => !v); }
  togglePrivacy() { this.showPrivacy.update(v => !v); }
  
  // expose ui if you want toggles in the template
  get state() { return this.ui; }
}
