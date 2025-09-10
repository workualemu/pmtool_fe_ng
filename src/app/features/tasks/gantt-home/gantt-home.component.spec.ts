import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttHomeComponent } from './gantt-home.component';

describe('GanttHomeComponent', () => {
  let component: GanttHomeComponent;
  let fixture: ComponentFixture<GanttHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GanttHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GanttHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
