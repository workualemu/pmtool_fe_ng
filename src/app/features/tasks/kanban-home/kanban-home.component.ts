import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-kanban-home',
  standalone: true,
  templateUrl: './kanban-home.component.html',
  styleUrls: ['./kanban-home.component.css']
})
export class KanbanHomeComponent {
  isModalOpen = signal(false);
  slideIn = signal(false);

  openModal() {
    this.isModalOpen.set(true);
    setTimeout(() => this.slideIn.set(true), 0);
  }

  closeModal() {
    this.slideIn.set(false);
    setTimeout(() => this.isModalOpen.set(false), 300); // match duration-300
  }

  onOverlayClick(e: MouseEvent) {
    if (e.target === e.currentTarget) this.closeModal();
  }
}
