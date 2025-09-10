import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-main-sidebar-item',
  imports: [LucideAngularModule, RouterLink, RouterLinkActive],
  templateUrl: './main-sidebar-item.component.html',
  styleUrls: ['./main-sidebar-item.component.css']
})
export class MainSidebarItemComponent {
  @Input() icon: string = '';
  @Input() label: string = '';
  @Input() tooltip: string = '';
  @Input() redirectTo: string = '';
  @Input() collapsed: boolean = false;

}
