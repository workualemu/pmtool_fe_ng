import { Component, Input, Output, EventEmitter, HostBinding, output, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// If you're using lucide-angular:
import { LucideAngularModule } from 'lucide-angular';
import { MainSidebarItem } from '../../models/utility.model';
import { MainSidebarItemComponent } from '../main-sidebar-item/main-sidebar-item.component';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

type FlyoutSide = 'right' | 'left';
type FlyoutPos = { left: number; top: number; maxHeight: number; side: FlyoutSide };

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [MainSidebarItemComponent, CommonModule, RouterModule, LucideAngularModule, ClickOutsideDirective],
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
    { 
      icon: 'settings', 
      label: 'Settings', 
      tooltip: 'Settings', 
      redirectTo: 'settings',
      children: [
        { label: 'Project statuses',icon: 'moon',   tooltip: 'Project statuses',  redirectTo: '/settings/appearance' },
        { label: 'Task priorities',   icon: 'user',  tooltip: 'Task priorities',   redirectTo: 'settings/task-priorities' },
        { label: 'Task statuses',   icon: 'shield', tooltip: 'Task statuses',  redirectTo: '/settings/account' },
      ]
    },
    {icon: 'circle-user-round', label: 'User', tooltip: 'User', redirectTo: 'users'},
  ];

  openSet = signal<Set<string>>(new Set());                    
  isOpen = (id: string) => computed(() => this.openSet().has(id));
  toggleAccordion(id: string) {
    const next = new Set(this.openSet());
    if (next.has(id)) next.delete(id);
    else {
      for (const k of next) next.delete(k);
      next.add(id);
    }
    this.openSet.set(next);
  }

  flyoutPos = signal<Record<string, FlyoutPos>>({});

  onParentClick(label: string, triggerEl: HTMLElement) {
    // toggle your open state
    this.toggleAccordion(label);

    if (!this.isOpen(label)() || !this.collapsed) return;

    const rect = triggerEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const panelWidth = 224;      // Tailwind w-56
    const gutter = 8;            // small gap from parent
    const margin = 8;            // viewport padding

    // Choose side (right by default; flip if not enough room)
    const spaceRight = vw - rect.right - margin;
    const side: FlyoutSide = spaceRight >= panelWidth + gutter ? 'right' : 'left';

    const left = side === 'right'
      ? rect.right + gutter
      : Math.max(margin, rect.left - panelWidth - gutter);

    // Vertical center on the parent row
    // We'll clamp the *center* based on maxHeight/2, then translateY(-50%)
    const maxHeight = vh - margin * 2;          // full-height minus margins
    const half = maxHeight / 2;
    let center = rect.top + rect.height / 2;
    center = Math.max(margin + half, Math.min(center, vh - margin - half));

    this.flyoutPos.update(m => ({ ...m, [label]: { left, top: center, maxHeight, side } }));
  }

}
