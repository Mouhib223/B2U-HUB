import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoringDashboardComponent } from './scoring-dashboard';

describe('ScoringDashboardComponent', () => {
  let component: ScoringDashboardComponent;
  let fixture: ComponentFixture<ScoringDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScoringDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoringDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
