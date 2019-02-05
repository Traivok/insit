import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MobileStatusComponent } from './mobile-status.component';

describe('MobileStatusComponent', () => {
  let component: MobileStatusComponent;
  let fixture: ComponentFixture<MobileStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MobileStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MobileStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
