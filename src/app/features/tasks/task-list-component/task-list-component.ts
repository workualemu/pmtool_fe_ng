import { Component, OnInit } from '@angular/core';
import { TaskCardComponent } from '../task-card-component/task-card-component';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { Column, TableAction } from '../../../models/wpm-column.model';
import { WpmTableComponent } from '../../../component/wpm-table/wpm-table.component';

@Component({
  selector: 'app-task-list-component',
  imports: [TaskCardComponent, WpmTableComponent],
  templateUrl: './task-list-component.html',
  styleUrl: './task-list-component.css'
})
export class TaskListComponent implements OnInit {
  title = 'Task List Component';
  tasks: Task[]= [];
  columns: Column<typeof this.tasks[number]>[] = [];
  actions: TableAction<typeof this.tasks[number]>[] = [];
 
  constructor(
    private taskService: TaskService
  ) {}

  ngOnInit() {
    this.tasks = this.taskService.getTasks();
    
    this.columns = [
      {key: 'title', label: 'Title', width: 10, sortable: true, filterable: true, justify: 'left'},
      {key: 'description', label: 'Description', width: 40, sortable: false, filterable: false, justify: 'left'},
      {key: 'start_date_planned', label: 'Start Date', width: 25, sortable: true, filterable: false, justify: 'right'},
    ];
    this.actions = [{ id: 'edit', label: 'Edit', icon: 'pencil' }, { id: 'delete', label: 'Del', icon: 'trash' }];
  }

  onCompleteTask(task: Task) {
    const found = this.tasks.find(t => t.id === task.id);
    if (found) {
      found.status = 'Completed';
      found.end_date_actual = new Date().toISOString().split('T')[0];
    }
  }

  handleTableAction(e: {id: string; row: Task}){
    if(e.id === 'edit') { alert('edit - ' + e.row.title); }
    if(e.id === 'delete'){ alert('delete - ' + e.row.title); }
  }
}
