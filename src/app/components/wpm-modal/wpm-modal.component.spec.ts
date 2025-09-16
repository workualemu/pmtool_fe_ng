import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WpmModalComponent } from './wpm-modal.component';

describe('WpmModalComponent', () => {
  let component: WpmModalComponent;
  let fixture: ComponentFixture<WpmModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WpmModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WpmModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
