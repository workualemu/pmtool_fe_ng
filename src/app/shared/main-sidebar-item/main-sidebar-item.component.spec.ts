import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSidebarItemComponent } from './main-sidebar-item.component';

describe('MainSidebarItemComponent', () => {
  let component: MainSidebarItemComponent;
  let fixture: ComponentFixture<MainSidebarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSidebarItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainSidebarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
