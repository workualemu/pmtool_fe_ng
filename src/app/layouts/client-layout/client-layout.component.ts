import { Component } from '@angular/core';
import { MainSidebarComponent } from '../../shared/main-sidebar/main-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { MainHeaderComponent } from '../../shared/main-header/main-header.component';
import { DialogHostDirective } from '../../shared/directives/dialog-host.directive';

@Component({
  selector: 'app-client-layout',
  imports: [MainSidebarComponent, RouterOutlet, MainHeaderComponent, DialogHostDirective],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {
  sidebarCollapsed = false;
}
