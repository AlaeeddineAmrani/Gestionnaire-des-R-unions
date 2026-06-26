import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReunionList } from './reunion-list';

describe('ReunionList', () => {
  let component: ReunionList;
  let fixture: ComponentFixture<ReunionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReunionList],
    }).compileComponents();

    fixture = TestBed.createComponent(ReunionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
