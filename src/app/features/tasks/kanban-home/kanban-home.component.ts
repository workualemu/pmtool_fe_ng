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
    start_date_planned: '2025-09-10',
    end_date_planned: '2025-09-10',
    start_date_actual: null,
    end_date_actual: null,
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
      start_date_planned: payload.start_date_planned,
      end_date_planned: payload.end_date_planned,
      start_date_actual: payload.start_date_actual,
      end_date_actual: payload.end_date_actual,
      status: payload.status,
      priority: payload.priority,
      description: payload.description
    }
  }
}
