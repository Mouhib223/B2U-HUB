import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWorkpost } from './student-workpost';

describe('StudentWorkpost', () => {
  let component: StudentWorkpost;
  let fixture: ComponentFixture<StudentWorkpost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentWorkpost]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentWorkpost);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
