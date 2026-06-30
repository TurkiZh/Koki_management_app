import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentOrder } from './current-order';

describe('CurrentOrder', () => {
  let component: CurrentOrder;
  let fixture: ComponentFixture<CurrentOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
