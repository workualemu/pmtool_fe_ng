import { Routes } from '@angular/router';
import { Login } from './component/login/login';
import { Register } from './component/register/register';
import { ResetPassword } from './component/reset-password/reset-password';
import { TaskListComponent } from './component/tasks/task-list-component/task-list-component';

export const routes: Routes = [
  {  path: 'login', component: Login },
  {  path: 'register', component: Register },
  {  path: 'resetpassword', component: ResetPassword },
  {  path: 'tasks', component: TaskListComponent },
  {  path: '**', component: TaskListComponent },
];
