import { Component, Input, Output, EventEmitter, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// If you're using lucide-angular:
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  templateUrl: './main-sidebar.component.html',
})
export class MainSidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  /** Optional: shift your layout when expanded (emit to parent if needed) */
  toggle() {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }

  // expose projectId/user perms if you need them:
  @Input() projectId: string | number | null = null;
  @Input() canManageUsers = false;
  @Input() canManageProjects = false;

  // For aria
  get ariaLabel(): string {
    return this.collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  }
}
