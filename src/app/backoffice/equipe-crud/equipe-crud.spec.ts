import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeCrud } from './equipe-crud';

describe('EquipeCrud', () => {
  let component: EquipeCrud;
  let fixture: ComponentFixture<EquipeCrud>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeCrud]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeCrud);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
