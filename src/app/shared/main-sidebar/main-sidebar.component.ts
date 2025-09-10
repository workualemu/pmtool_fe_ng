import { Component, Input, Output, EventEmitter, HostBinding, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// If you're using lucide-angular:
import { LucideAngularModule } from 'lucide-angular';
import { MainSidebarItem } from '../../models/utility.model';
import { MainSidebarItemComponent } from '../main-sidebar-item/main-sidebar-item.component';

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [MainSidebarItemComponent, CommonModule, RouterModule, LucideAngularModule],
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
  mobileOpen = false;

  // For aria
  get ariaLabel(): string {
    return this.collapsed ? 'Expand sidebar' : 'Collapse sidebar';
  }

  readonly items: MainSidebarItem[] = [
    {icon: 'home', label: 'Home', tooltip: 'Home', redirectTo: '/'},
    {icon: 'clipboard-list', label: 'Tasks', tooltip: 'Tasks', redirectTo: 'tasks'},
    {icon: 'square-kanban', label: 'Kanban board', tooltip: 'Kanban board', redirectTo: 'kanban-home'},
    {icon: 'chart-gantt', label: 'Gantt chart', tooltip: 'Gantt chart', redirectTo: 'gantt-home'},
    {icon: 'chart-pie', label: 'Reports', tooltip: 'Reports', redirectTo: 'reports'},
  ];

  readonly bottomItems: MainSidebarItem[] = [
    {icon: 'circle-user-round', label: 'User', tooltip: 'User', redirectTo: 'users'},
    {icon: 'settings', label: 'Settings', tooltip: 'Settings', redirectTo: 'settings'},
  ];
}
