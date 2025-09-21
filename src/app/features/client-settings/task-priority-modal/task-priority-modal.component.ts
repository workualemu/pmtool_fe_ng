import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { TaskPriority } from '../../../models/task-priority.model';
import { ColorPickerComponent } from '../../../components/color-picker/color-picker.component';

type Mode = 'create' | 'edit';
type RecordUpsert = Omit<TaskPriority, 'id'> & { id?: number };

@Component({
  selector: 'app-task-priority-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ColorPickerComponent],
  templateUrl: './task-priority-modal.component.html',
  styleUrl: './task-priority-modal.component.css'
})
export class TaskPriorityModalComponent {
  record = input<TaskPriority | null>(null);

  save = output<RecordUpsert>();
  cancel = output<void>();

  private fb = inject(FormBuilder);
  saving = signal(false);
  mode = signal<Mode>('create');

  // Form controls — required fields are non-empty strings; actuals can be null.
  form = this.fb.group(
    {
      value: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(200)]),
      description: this.fb.nonNullable.control(''),
      color: ['#3b82f6', [Validators.pattern(/^#([0-9a-fA-F]{6})$/)]],
    }
  );

  constructor() {
    // Populate form when taskPriority() arrives; reset for create mode
    effect(() => {
      const t = this.record();
      if (t) {
        this.mode.set('edit');
        this.form.patchValue(
          {
            value: t.value,
            description: t.description ?? '',
            color: t.color,
          },
          { emitEvent: false }
        );
      } else {
        this.mode.set('create');
        this.form.reset(
          {
            value: '',
            description: '',
            color: '#858585',
          },
          { emitEvent: false }
        );
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.saving.set(true);

    const existing = this.record();
    const v = this.form.getRawValue();

    const payload: RecordUpsert = {
      id: existing?.id, 
      value: v.value,
      description: v.description || undefined,
      color: v.color || undefined,
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
