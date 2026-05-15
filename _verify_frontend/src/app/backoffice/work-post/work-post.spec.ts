import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkPost } from './work-post';

describe('WorkPost', () => {
  let component: WorkPost;
  let fixture: ComponentFixture<WorkPost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkPost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkPost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
