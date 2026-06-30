import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoSquared } from './info-squared';

describe('InfoSquared', () => {
  let component: InfoSquared;
  let fixture: ComponentFixture<InfoSquared>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoSquared],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoSquared);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
