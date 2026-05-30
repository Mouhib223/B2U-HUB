import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipeEntreprise } from './equipe-entreprise';

describe('EquipeEntreprise', () => {
  let component: EquipeEntreprise;
  let fixture: ComponentFixture<EquipeEntreprise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipeEntreprise]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipeEntreprise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
