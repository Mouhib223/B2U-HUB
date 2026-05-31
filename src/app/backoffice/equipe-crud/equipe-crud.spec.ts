import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { EquipeCrudComponent } from './equipe-crud';
import { EquipeService, Equipe } from '../../core/services/equipe.service';

describe('EquipeCrudComponent — Tests Fonctionnels', () => {
  let component: EquipeCrudComponent;
  let fixture: ComponentFixture<EquipeCrudComponent>;
  let equipeService: jasmine.SpyObj<EquipeService>;

  const mockEquipes: Equipe[] = [
    { idEquipe: 'eq-001', nomMembresEquipe: 'Team Alpha', descriptionProfil: 'Équipe fullstack', status: 'ACTIVE', tasks: [] },
    { idEquipe: 'eq-002', nomMembresEquipe: 'Team Beta', descriptionProfil: 'Équipe backend', status: 'INACTIVE', tasks: [] }
  ];

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('EquipeService', ['getAll', 'add', 'update', 'delete']);
    spy.getAll.and.returnValue(of(mockEquipes));
    spy.delete.and.returnValue(of('Deleted'));
    spy.add.and.returnValue(of(mockEquipes[0]));
    spy.update.and.returnValue(of(mockEquipes[0]));

    await TestBed.configureTestingModule({
      imports: [EquipeCrudComponent, HttpClientTestingModule],
      providers: [
        { provide: EquipeService, useValue: spy },
        provideHttpClient()
      ]
    }).compileComponents();

    equipeService = TestBed.inject(EquipeService) as jasmine.SpyObj<EquipeService>;
    fixture = TestBed.createComponent(EquipeCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load equipes on init', () => {
    expect(equipeService.getAll).toHaveBeenCalled();
    expect(component.equipes.length).toBe(2);
  });

  it('should filter equipes by search query', () => {
    component.searchQuery = 'Alpha';
    expect(component.filteredEquipes.length).toBe(1);
    expect(component.filteredEquipes[0].nomMembresEquipe).toBe('Team Alpha');
  });

  it('should open and close add modal', () => {
    component.openAddModal();
    expect(component.showAddModal).toBeTrue();
    component.closeAddModal();
    expect(component.showAddModal).toBeFalse();
  });

  it('should open and close edit modal', () => {
    component.openEditModal(mockEquipes[0]);
    expect(component.showEditModal).toBeTrue();
    expect(component.selectedEquipe.idEquipe).toBe('eq-001');
    component.closeEditModal();
    expect(component.showEditModal).toBeFalse();
    expect(component.selectedEquipe).toBeNull();
  });

  it('should NOT add equipe if fields are empty', () => {
    component.newEquipe = { nomMembresEquipe: '', descriptionProfil: '', status: 'active' };
    component.addEquipe();
    expect(equipeService.add).not.toHaveBeenCalled();
    expect(component.submitted).toBeTrue();
  });

  it('should add equipe when fields are valid', () => {
    component.newEquipe = { nomMembresEquipe: 'Team Gamma', descriptionProfil: 'Nouvelle équipe', status: 'active' };
    component.addEquipe();
    expect(equipeService.add).toHaveBeenCalled();
  });

  it('should confirm and delete equipe', () => {
    component.confirmDelete(mockEquipes[0]);
    expect(component.showDeleteConfirm).toBeTrue();
    expect(component.selectedEquipe.idEquipe).toBe('eq-001');
    component.deleteEquipeConfirmed();
    expect(equipeService.delete).toHaveBeenCalledWith('eq-001');
  });

  it('should cancel delete', () => {
    component.confirmDelete(mockEquipes[0]);
    component.cancelDelete();
    expect(component.showDeleteConfirm).toBeFalse();
    expect(component.selectedEquipe).toBeNull();
  });

  it('should handle error when loading equipes fails', () => {
    equipeService.getAll.and.returnValue(throwError(() => new Error('Network error')));
    component.ngOnInit();
    expect(component).toBeTruthy();
  });
});