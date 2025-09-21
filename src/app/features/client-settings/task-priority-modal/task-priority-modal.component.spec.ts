import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPriorityModalComponent } from './task-priority-modal.component';

describe('TaskPriorityModalComponent', () => {
  let component: TaskPriorityModalComponent;
  let fixture: ComponentFixture<TaskPriorityModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPriorityModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskPriorityModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
