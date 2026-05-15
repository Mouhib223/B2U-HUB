import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeFront } from './equipe-front';

describe('EquipeFront', () => {
  let component: EquipeFront;
  let fixture: ComponentFixture<EquipeFront>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeFront]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeFront);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
