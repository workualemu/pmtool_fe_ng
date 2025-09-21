import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskPriorityListComponent } from './task-priority-list.component';

describe('TaskPriorityListComponent', () => {
  let component: TaskPriorityListComponent;
  let fixture: ComponentFixture<TaskPriorityListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskPriorityListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskPriorityListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
