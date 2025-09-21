import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpListOptions, HttpPageResponse } from '../models/utility.model';
import { TaskPriority } from '../models/task-priority.model';

const apiUrlTasks = `${environment.apiUrl}/client/admin`;

@Injectable({ providedIn: 'root' })
export class ClientSettingService {
  private http = inject(HttpClient);

  projectId: number = 5;

  getTaskPrioritiesByProject(projectId: number, opts: Partial<HttpListOptions> = {}): Observable<HttpPageResponse<TaskPriority>> {
    const {
      pageNumber = 0,
      pageSize = 5,
      sortBy = 'value',
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
    return this.http.get<HttpPageResponse<TaskPriority>>(`${apiUrlTasks}/${projectId}/taskpriorities`, { params });
  }

  upsertTaskPriority(projectId: number, record: Omit<TaskPriority, 'id'> & {id?: number}): Observable<TaskPriority> {
    if (record.id) {
      return this.http.put<TaskPriority>(`${apiUrlTasks}/taskpriorities/${record.id}`, record);
    } else {
      return this.http.post<TaskPriority>(`${apiUrlTasks}/${projectId}/taskpriority`, record);
    }
  }

  deleteTaskPriority(record: TaskPriority): Observable<TaskPriority> {
    return this.http.delete<TaskPriority>(`${apiUrlTasks}/taskpriorities/${record.id}`);
  }

}
