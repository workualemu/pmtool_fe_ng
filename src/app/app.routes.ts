import { Routes } from '@angular/router';
import { Register } from './component/register/register';
import { ResetPassword } from './component/reset-password/reset-password';
import { TaskListComponent } from './features/tasks/task-list-component/task-list-component';
import { LoginComponent } from './auth/login/login.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { SystemLayoutComponent } from './layouts/system-layout/system-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';
import { KanbanHomeComponent } from './features/tasks/kanban-home/kanban-home.component';
import { GanttHomeComponent } from './features/tasks/gantt-home/gantt-home.component';
import { ReportHomeComponent } from './features/report-home/report-home.component';
import { TaskPriorityListComponent } from './features/client-settings/task-priority-list/task-priority-list.component';

export const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' }, 
    ],
  },
  {  path: 'systemhome', component: SystemLayoutComponent },
  {  
    path: 'clienthome', 
    component: ClientLayoutComponent,
    children: [
      {  path: 'tasks', component: TaskListComponent },
      {  path: 'kanban-home', component: KanbanHomeComponent },
      {  path: 'gantt-home', component: GanttHomeComponent },
      {  path: 'reports', component: ReportHomeComponent },
      {  path: 'settings/task-priorities', component: TaskPriorityListComponent },
    ]
  },
  {  path: 'register', component: Register },
  {  path: 'resetpassword', component: ResetPassword },
  {  path: 'clients', component: ClientListComponent },
];
