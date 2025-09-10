import { Component } from '@angular/core';
import { MainSidebarComponent } from '../../shared/main-sidebar/main-sidebar.component';
import { RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-client-layout',
  imports: [MainSidebarComponent, RouterOutlet, NgClass],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {
  sidebarCollapsed = false;
}
