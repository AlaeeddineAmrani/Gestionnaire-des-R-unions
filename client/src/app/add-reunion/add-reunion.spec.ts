import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReunion } from './add-reunion';

describe('AddReunion', () => {
  let component: AddReunion;
  let fixture: ComponentFixture<AddReunion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReunion],
    }).compileComponents();

    fixture = TestBed.createComponent(AddReunion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
