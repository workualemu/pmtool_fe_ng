// src/app/tasks/task-dialog.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA} from '@angular/cdk/dialog';
import { Task } from '../../../models/task.model';

type DialogMode = 'create' | 'edit';
type DialogData = { mode: DialogMode; task?: Task };

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css']
})
export class TaskModalComponent {
  private fb = inject(FormBuilder);
  readonly ref = inject(DialogRef<Task | null>);
  readonly data = inject<DialogData>(DIALOG_DATA);

  saving = signal(false);

  form = this.fb.group({
    title: [this.data.task?.title ?? '', Validators.required],
    description: [this.data.task?.description ?? ''],
    plannedStartDate: [this.data.task?.start_date_planned ?? ''],
    plannedEndDate: [this.data.task?.end_date_planned ?? ''],
    priority: [this.data.task?.priority],
    status: [this.data.task?.status, Validators.required]
  });

  close() {
    this.ref.close(null);
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    // Build the payload. If edit, keep the id.
    const payload: Task = {
      ...(this.data.task ?? {}),
      ...this.form.value,
    } as Task;

    // Simulate async save; replace with your service call.
    // e.g., (this.data.mode === 'create' ? taskService.create(payload) : taskService.update(payload))
    setTimeout(() => {
      this.saving.set(false);
      this.ref.close(payload); // return saved task to the caller
    }, 400);
  }
}
