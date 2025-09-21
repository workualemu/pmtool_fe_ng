import { Component, signal } from '@angular/core';
import { WpmModalComponent } from '../../../components/wpm-modal/wpm-modal.component';
import { TaskModalComponent } from "../task-modal/task-modal.component";
import { Task } from '../../../models/task.model';

@Component({
  selector: 'app-kanban-home',
  standalone: true,
  imports: [WpmModalComponent, TaskModalComponent],
  templateUrl: './kanban-home.component.html',
  styleUrls: ['./kanban-home.component.css']
})
export class KanbanHomeComponent {
  slideIn = signal(false);

  show = signal(false);
  data = { 
    id: 1,
    title: "Task 1",
    startDate: '2025-09-10',
    endDate: '2025-09-10',
    actualStartDate: null,
    actualEndDate: null,
    status: "In Progress",
    priority: "Low",
    description: "This task 1 is intended to finalize ..."
  } as Task

  openModal() {
    this.show.set(true);
    setTimeout(() => this.slideIn.set(true), 0);
  }

  closeModal() {
    this.slideIn.set(false);
    setTimeout(() => this.show.set(false), 300); // match duration-300
  }

  onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeModal();
  }

  onTaskSave(payload: Omit<Task, 'id'> & { id?: number}) {
    if (payload.id == null) throw new Error('Missing id in edit flow');

    this.data = { 
      id: payload.id ?? null,
      title: payload.title,
      startDate: payload.startDate,
      endDate: payload.endDate,
      actualStartDate: payload.actualStartDate,
      actualEndDate: payload.actualEndDate,
      status: payload.status,
      priority: payload.priority,
      description: payload.description
    }
  }
}
