import { Injectable } from '@angular/core';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: Task[] = [
      {id: 1, title: "Task 1", start_date_planned: "2023-08-01", end_date_planned: "2023-08-05", start_date_actual: "2023-08-01", end_date_actual: "2023-08-04", status: "Completed", priority: "High", description: "Description for Task 1"},
      {id: 2, title: "Task 2", start_date_planned: "2023-08-03", end_date_planned: "2023-08-07", start_date_actual: "2023-08-03", end_date_actual: null, status: "In Progress", priority: "Medium", description: "Description for Task 2"},
      {id: 3, title: "Task 3", start_date_planned: "2023-08-05", end_date_planned: "2023-08-10", start_date_actual: null, end_date_actual: null, status: "Not Started", priority: "Low", description: "Description for Task 3"},
      {id: 4, title: "Task 4", start_date_planned: "2023-08-07", end_date_planned: "2023-08-12", start_date_actual: null, end_date_actual: null, status: "Not Started", priority: "High", description: "Description for Task 4"},
      {id: 5, title: "Task 5", start_date_planned: "2023-08-09", end_date_planned: "2023-08-15", start_date_actual: null, end_date_actual: null, status: "Not Started", priority: "Medium", description: "Description for Task 5"},
    ]

    getTasks(): Task[] {
      return this.tasks;
    }
    
}
