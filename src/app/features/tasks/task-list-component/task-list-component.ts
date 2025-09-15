import { Component, OnInit } from '@angular/core';
import { TaskCardComponent } from '../task-card-component/task-card-component';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { Column, TableAction } from '../../../models/wpm-column.model';
import { WpmTableComponent } from '../../../component/wpm-table/wpm-table.component';
import { HttpListOptions, HttpPageResponse } from '../../../models/utility.model';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { Overlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-task-list-component',
  imports: [TaskCardComponent, WpmTableComponent, DialogModule],
  templateUrl: './task-list-component.html',
  styleUrl: './task-list-component.css'
  
})
export class TaskListComponent implements OnInit {
  title = 'Task List Component';
  response: HttpPageResponse<Task> | null = null;
  tasks: Task[] = [];
  columns: Column<Task>[] = [];
  actions: TableAction<Task>[] = [];

  listOptions: HttpListOptions = {
        pageNumber: 0,
        pageSize: 5,
        sortBy: 'description',
        sortDir: 'desc',
      };
 
  constructor(
    private taskService: TaskService,
    private dialog: Dialog,
    private overlay: Overlay

  ) {}

  ngOnInit() {
    // this.tasks = this.taskService.getTasks();

    this.taskService.getTasks(this.listOptions)
      .subscribe(res => {
        this.tasks = res.content;
        this.response = res;
      });

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

  addTask() {
    const ref = this.dialog.open(TaskModalComponent, {
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-dark-backdrop',
      panelClass: 'task-sheet-panel',
      data: { mode: 'create' } as const,
      positionStrategy: this.overlay.position().global().right('0').top('0'),
      width: 'min(75vw, 72rem)',
      height: '100dvh',
    });

    // ref.closed.subscribe(result => {
    //   if (!result) return;
      // Assign an id (back-end would do this)
      // const newTask = { ...result, id: Date.now() };
      // this.tasks = [newTask, ...this.tasks];
    // });
  }


  // openEdit(task: Task) {
  //   const ref = this.dialog.open(TaskDialogComponent, {
  //     data: { mode: 'edit', task } as const
  //   });

  //   ref.closed.subscribe(result => {
  //     if (!result) return;
  //     this.tasks = this.tasks.map(t => (t.id === task.id ? { ...t, ...result } : t));
  //   });
  // }

}
