import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReunionComponent } from './edit-reunion';

describe('EditReunionComponent', () => {
  let component: EditReunionComponent;
  let fixture: ComponentFixture<EditReunionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReunionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditReunionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
