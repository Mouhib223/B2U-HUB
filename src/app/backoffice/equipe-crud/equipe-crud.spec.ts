import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeCrudComponent } from './equipe-crud';

describe('EquipeCrudComponent', () => {
  let component: EquipeCrudComponent;
  let fixture: ComponentFixture<EquipeCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
