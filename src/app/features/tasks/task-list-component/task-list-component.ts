import { Component, OnInit } from '@angular/core';
import { TaskCardComponent } from '../task-card-component/task-card-component';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';

@Component({
  selector: 'app-task-list-component',
  imports: [TaskCardComponent],
  templateUrl: './task-list-component.html',
  styleUrl: './task-list-component.css'
})
export class TaskListComponent implements OnInit {
  title = 'Task List Component';
  tasks: Task[]= [];
 
  constructor(
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.tasks = this.taskService.getTasks();
  }

  onCompleteTask(task: Task) {
    const found = this.tasks.find(t => t.id === task.id);
    if (found) {
      found.status = 'Completed';
      found.end_date_actual = new Date().toISOString().split('T')[0];
    }
  }
}
