import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewReunionComponent } from './view-reunion';

describe('ViewReunionComponent', () => {
  let component: ViewReunionComponent;
  let fixture: ComponentFixture<ViewReunionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewReunionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewReunionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
