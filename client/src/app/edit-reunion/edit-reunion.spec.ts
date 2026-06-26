import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReunion } from './edit-reunion';

describe('EditReunion', () => {
  let component: EditReunion;
  let fixture: ComponentFixture<EditReunion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReunion],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReunion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
