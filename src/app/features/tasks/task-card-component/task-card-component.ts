import { DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-task-card-component',
  imports: [DatePipe],
  templateUrl: './task-card-component.html',
  styleUrl: './task-card-component.css'
})
export class TaskCardComponent {
  @Input() task?: Task;
  @Output() completeTask = new EventEmitter<Task>();

  onCompleteTask() {
    this.completeTask.emit(this.task);
  }
}
