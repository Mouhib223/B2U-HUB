import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPostDetail } from './work-post-detail';

describe('WorkPostDetail', () => {
  let component: WorkPostDetail;
  let fixture: ComponentFixture<WorkPostDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPostDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPostDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
