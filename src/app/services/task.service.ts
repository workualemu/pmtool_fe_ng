// @Injectable({
//   providedIn: 'root'
// })
// export class TaskService {
//   private tasks: Task[] = [
//       {id: 1, title: "Task 1", start_date_planned: "2023-08-01", end_date_planned: "2023-08-05", start_date_actual: "2023-08-01", end_date_actual: "2023-08-04", status: "Completed", priority: "High", description: "Description for Task 1"},
//       {id: 2, title: "Task 2", start_date_planned: "2023-08-03", end_date_planned: "2023-08-07", start_date_actual: "2023-08-03", end_date_actual: null, status: "In Progress", priority: "Medium", description: "Description for Task 2"},
//       {id: 3, title: "Task 3", start_date_planned: "2023-08-05", end_date_planned: "2023-08-10", start_date_actual: null, end_date_actual: null, status: "Not Started", priority: "Low", description: "Description for Task 3"},
//     ]

//     getTasks(): Task[] {
//       return this.tasks;
//     }
    
// }

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Task } from '../models/task.model';
import { HttpListOptions, HttpPageResponse } from '../models/utility.model';

// const apiUrlProjects = `${environment.apiUrl}/client/admin/tasks`;
const apiUrlTasks = `${environment.apiUrl}/client/admin`;

// export interface PageResponse<T> {
//   content: T[];
//   totalElements: number;
//   totalPages: number;
//   size: number;     // page size
//   number: number;   // current page index
//   first?: boolean;
//   last?: boolean;
// }

// export type SortDir = 'asc' | 'desc';

// export interface ListOptions {
//   pageNumber: number;
//   pageSize: number;
//   sortBy: string;
//   sortDir: SortDir;
// }

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

  projectId: number = 5;

  getTasksByProject(projectId: number, opts: Partial<HttpListOptions> = {}): Observable<HttpPageResponse<Task>> {
    const {
      pageNumber = 0,
      pageSize = 5,
      sortBy = 'description',
      sortDir = 'desc',
    } = opts;

    const params = new HttpParams({
      fromObject: {
        pageNumber: String(pageNumber),
        pageSize: String(pageSize),
        sortBy,
        sortDir,
      },
    });
    return this.http.get<HttpPageResponse<Task>>(`${apiUrlTasks}/${projectId}/tasks`, { params });
  }

  upsertTask(projectId: number, task: Omit<Task, 'id'> & {id?: number}): Observable<Task> {
    if (task.id) {
      return this.http.put<Task>(`${apiUrlTasks}/tasks/${task.id}`, task);
    } else {
      return this.http.post<Task>(`${apiUrlTasks}/${projectId}/task`, task);
    }
  }

  deleteTask(task: Task): Observable<Task> {
    return this.http.delete<Task>(`${apiUrlTasks}/tasks/${task.id}`);
  }

}
