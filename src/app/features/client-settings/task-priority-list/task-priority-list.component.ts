import { Component, signal } from '@angular/core';
import { WpmTableComponent } from '../../../component/wpm-table/wpm-table.component';
import { WpmModalComponent } from '../../../components/wpm-modal/wpm-modal.component';
import { HttpListOptions, HttpPageResponse } from '../../../models/utility.model';
import { TaskPriority } from '../../../models/task-priority.model';
import { Column, TableAction } from '../../../models/wpm-column.model';
import { ConfirmService } from '../../../shared/confirm/confirm.service';
import { ClientSettingService } from '../../../services/client-setting.service';
import { TaskPriorityModalComponent } from '../task-priority-modal/task-priority-modal.component';

@Component({
  selector: 'app-task-priority-list',
  imports: [WpmTableComponent, WpmModalComponent, TaskPriorityModalComponent],
  templateUrl: './task-priority-list.component.html',
  styleUrl: './task-priority-list.component.css'
})
export class TaskPriorityListComponent {
title = 'Task Priorities';
  response: HttpPageResponse<TaskPriority> | null = null;
  records: TaskPriority[] = [];
  columns: Column<TaskPriority>[] = [];
  actions: TableAction<TaskPriority>[] = [];
  currentRecord: TaskPriority | null = null;

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
    private clientSettingService: ClientSettingService,
    private confirm: ConfirmService
  ) {}

  ngOnInit() {
    this.columns = [
      {key: 'value', label: 'Value', width: 10, sortable: true, filterable: true, justify: 'left'},
      {key: 'description', label: 'Description', width: 40, sortable: false, filterable: false, justify: 'left'},
      {key: 'color', label: 'Color', width: 25, sortable: true, filterable: false, justify: 'right'},
    ];
    this.actions = [{ id: 'edit', label: 'Edit', icon: 'pencil' }, { id: 'delete', label: 'Del', icon: 'trash' }];
    this.getrecords();
  }

  getrecords(){
    this.clientSettingService.getTaskPrioritiesByProject(this.currentProjectId, this.listOptions)
      .subscribe(res => {
        this.records = res.content;
        this.response = res;
      });
  }

  handleTableAction(e: {id: string; row: TaskPriority}){
    if(e.id === 'edit') { this.onEdit(e.row); }
    if(e.id === 'delete'){ this.onDelete(e.row); }
  }

  submitTask(payload: Omit<TaskPriority, 'id'> & { id?: number}) {
    this.clientSettingService.upsertTaskPriority(this.currentProjectId, payload)
      .subscribe((res)=>{ 
        this.currentRecord = res;
        this.getrecords();
      });    
  }

  addNewTask(){
    this.currentRecord = null;
    this.openTaskModal();
  }

  onEdit(record: TaskPriority){
    this.currentRecord = record;
    this.openTaskModal();
  }

  async onDelete(record: TaskPriority) {
    const ok = await this.confirm.ask({
      title: 'Delete task?',
      message: `“${record.value}” will be permanently removed.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      danger: true,
    });
    if (!ok) 
      return;
    this.clientSettingService.deleteTaskPriority(record).subscribe({
      next: () => {
        this.getrecords();
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