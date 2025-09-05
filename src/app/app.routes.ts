import { Routes } from '@angular/router';
import { Register } from './component/register/register';
import { ResetPassword } from './component/reset-password/reset-password';
import { TaskListComponent } from './features/tasks/task-list-component/task-list-component';
import { LoginComponent } from './auth/login/login.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';

export const routes: Routes = [
  {  path: '', redirectTo: 'tasks', pathMatch: 'full' },
  {  path: 'login', component: LoginComponent },
  {  path: 'register', component: Register },
  {  path: 'resetpassword', component: ResetPassword },
  {  path: 'clients', component: ClientListComponent },
  {  path: 'tasks', component: TaskListComponent },
];
