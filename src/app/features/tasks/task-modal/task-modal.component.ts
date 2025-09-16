import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Task } from '../../../models/task.model';

type Mode = 'create' | 'edit';
type TaskUpsert = Omit<Task, 'id'> & { id?: number };

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-modal.component.html',
  styleUrls: ['./task-modal.component.css'],
})
export class TaskModalComponent {
  task = input<Task | null>(null);

  // Outputs
  save = output<TaskUpsert>();
  cancel = output<void>();

  private fb = inject(FormBuilder);
  saving = signal(false);
  mode = signal<Mode>('create');

  // Form controls — required fields are non-empty strings; actuals can be null.
  form = this.fb.group(
    {
      title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
      description: this.fb.nonNullable.control(''),

      status: this.fb.nonNullable.control<Task['status']>('Not Started', [Validators.required]),

      start_date_planned: this.fb.nonNullable.control('', [Validators.required]),
      end_date_planned:   this.fb.nonNullable.control('', [Validators.required]),

      // actuals: string | null (nullable)
      start_date_actual: new FormControl<string | null>(null),
      end_date_actual:   new FormControl<string | null>(null),

      priority: this.fb.nonNullable.control<Task['priority']>('Medium', [Validators.required]),
    },
    { validators: dateOrderValidator }
  );

  constructor() {
    // Populate form when task() arrives; reset for create mode
    effect(() => {
      const t = this.task();
      if (t) {
        this.mode.set('edit');
        this.form.patchValue(
          {
            title: t.title,
            description: t.description ?? '',
            status: t.status,
            start_date_planned: t.start_date_planned,
            end_date_planned: t.end_date_planned,
            start_date_actual: t.start_date_actual ?? null,
            end_date_actual: t.end_date_actual ?? null,
            priority: t.priority,
          },
          { emitEvent: false }
        );
      } else {
        this.mode.set('create');
        this.form.reset(
          {
            title: '',
            description: '',
            status: 'Not Started',
            start_date_planned: '',
            end_date_planned: '',
            start_date_actual: null,
            end_date_actual: null,
            priority: 'Medium',
          },
          { emitEvent: false }
        );
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const existing = this.task();
    const v = this.form.getRawValue();

    // Build payload matching your Task typing (no undefined for required strings)
    const payload: TaskUpsert = {
      id: existing?.id, // undefined for create
      title: v.title,
      description: v.description || undefined,
      status: v.status,
      start_date_planned: v.start_date_planned,
      end_date_planned: v.end_date_planned,
      start_date_actual: v.start_date_actual ?? null,
      end_date_actual: v.end_date_actual ?? null,
      priority: v.priority,
    };

    this.save.emit(payload);
    this.saving.set(false);
  }
}

/** end_date_planned must be >= start_date_planned (both yyyy-mm-dd strings) */
function dateOrderValidator(group: AbstractControl): ValidationErrors | null {
  const start = group.get('start_date_planned')?.value as string | null | undefined;
  const end   = group.get('end_date_planned')?.value as string | null | undefined;
  if (!start || !end) return null;
  return end >= start ? null : { dateOrder: true };
}
