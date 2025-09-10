import { Routes } from '@angular/router';
import { Register } from './component/register/register';
import { ResetPassword } from './component/reset-password/reset-password';
import { TaskListComponent } from './features/tasks/task-list-component/task-list-component';
import { LoginComponent } from './auth/login/login.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { BaseLayoutComponent } from './layouts/base-layout/base-layout.component';
import { SystemLayoutComponent } from './layouts/system-layout/system-layout.component';
import { ClientLayoutComponent } from './layouts/client-layout/client-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: BaseLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: '', pathMatch: 'full', redirectTo: 'login' }, // optional default
    ],
  },
  {  path: 'systemhome', component: SystemLayoutComponent },
  {  path: 'clienthome', component: ClientLayoutComponent },
  {  path: 'register', component: Register },
  {  path: 'resetpassword', component: ResetPassword },
  {  path: 'clients', component: ClientListComponent },
  {  path: 'tasks', component: TaskListComponent },
];
