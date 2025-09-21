import { Component, OnInit, signal } from '@angular/core';
import { Task } from '../../../models/task.model';
import { TaskService } from '../../../services/task.service';
import { Column, TableAction } from '../../../models/wpm-column.model';
import { WpmTableComponent } from '../../../component/wpm-table/wpm-table.component';
import { HttpListOptions, HttpPageResponse } from '../../../models/utility.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';
import { Overlay } from '@angular/cdk/overlay';
import { WpmModalComponent } from '../../../components/wpm-modal/wpm-modal.component';
import { ConfirmService } from '../../../shared/confirm/confirm.service';

@Component({
  selector: 'app-task-list-component',
  imports: [WpmTableComponent, WpmModalComponent, TaskModalComponent],
  templateUrl: './task-list-component.html',
  styleUrl: './task-list-component.css'
  
})
export class TaskListComponent implements OnInit {
  title = 'Tasks';
  response: HttpPageResponse<Task> | null = null;
  tasks: Task[] = [];
  columns: Column<Task>[] = [];
  actions: TableAction<Task>[] = [];
  currentTask: Task | null = null;

  slideIn = signal(false);
  show = signal(false);
  currentProjectId: number = 5;

  listOptions: HttpListOptions = {
        pageNumber: 0,
        pageSize: 5,
        sortBy: 'description',
        sortDir: 'desc',
      };
 
  constructor(
    private taskService: TaskService,
    private confirm: ConfirmService
  ) {}

  ngOnInit() {
    this.columns = [
      {key: 'title', label: 'Title', width: 10, sortable: true, filterable: true, justify: 'left'},
      {key: 'description', label: 'Description', width: 40, sortable: false, filterable: false, justify: 'left'},
      {key: 'startDate', label: 'Start Date (Planned)', width: 25, sortable: true, filterable: false, justify: 'right'},
    ];
    this.actions = [{ id: 'edit', label: 'Edit', icon: 'pencil' }, { id: 'delete', label: 'Del', icon: 'trash' }];
    this.getTasks();
  }

  getTasks(){
    this.taskService.getTasksByProject(this.currentProjectId, this.listOptions)
      .subscribe(res => {
        this.tasks = res.content;
        this.response = res;
      });
  }

  onCompleteTask(task: Task) {
    const found = this.tasks.find(t => t.id === task.id);
    if (found) {
      found.status = 'Completed';
      found.actualEndDate = new Date().toISOString().split('T')[0];
    }
  }

  handleTableAction(e: {id: string; row: Task}){
    if(e.id === 'edit') { this.onEdit(e.row); }
    if(e.id === 'delete'){ this.onDelete(e.row); }
  }

  submitTask(payload: Omit<Task, 'id'> & { id?: number}) {
    this.taskService.upsertTask(this.currentProjectId, payload)
      .subscribe((res)=>{ 
        this.currentTask = res;
        this.getTasks();
      });    
  }

  addNewTask(){
    this.currentTask = null;
    this.openTaskModal();
  }

  onEdit(task: Task){
    this.currentTask = task;
    this.openTaskModal();
  }

  async onDelete(task: Task) {
    const ok = await this.confirm.ask({
      title: 'Delete task?',
      message: `“${task.title}” will be permanently removed.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) 
      return;
    this.taskService.deleteTask(task).subscribe({
      next: () => {
        this.getTasks();
        },
      error: () => { /* revert / toast */ },
    });
  }

  

  //--------------------------Modal-------------------------------------------//
  openTaskModal() {
    this.show.set(true);
    setTimeout(() => this.slideIn.set(true), 0);
  }

  closeTaskModal() {
    this.slideIn.set(false);
    setTimeout(() => this.show.set(false), 300); // match duration-300
  }

  onOverlayClickTaskModal(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeTaskModal();
  }

}
