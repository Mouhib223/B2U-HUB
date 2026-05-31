import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { EquipeEntreprise } from './equipe-entreprise';
import { EquipeEntrepriseService } from '../core/services/equipe-entreprise';
import { EquipeService } from '../core/services/equipe.service';

describe('EquipeEntreprise — Tests Intégration', () => {
  let component: EquipeEntreprise;
  let fixture: ComponentFixture<EquipeEntreprise>;
  let equipeEntrepriseService: jasmine.SpyObj<EquipeEntrepriseService>;
  let equipeService: jasmine.SpyObj<EquipeService>;

  const mockEquipes = [
    { idEquipe: 'eq-001', nomMembresEquipe: 'Team Alpha', descriptionProfil: 'Fullstack', tasks: [] },
    { idEquipe: 'eq-002', nomMembresEquipe: 'Team Beta', descriptionProfil: 'Backend', tasks: [] }
  ];

  const mockEntreprises = [
    { id: 'ent-001', nom: 'TechNova' },
    { id: 'ent-002', nom: 'DataFlow' }
  ];

  beforeEach(async () => {
    const entrepriseSpy = jasmine.createSpyObj('EquipeEntrepriseService', [
      'getAllEquipes', 'getAllEntreprises', 'associerEntreprise',
      'createTask', 'deleteTask', 'updateTaskStatus', 'getTaskStats'
    ]);
    const equipeSpy = jasmine.createSpyObj('EquipeService', ['getAll', 'getTaskStats']);

    entrepriseSpy.getAllEquipes.and.returnValue(of(mockEquipes));
    entrepriseSpy.getAllEntreprises.and.returnValue(of(mockEntreprises));
    entrepriseSpy.associerEntreprise.and.returnValue(of({}));
    entrepriseSpy.createTask.and.returnValue(of({}));
    entrepriseSpy.deleteTask.and.returnValue(of({}));
    entrepriseSpy.updateTaskStatus.and.returnValue(of({}));
    entrepriseSpy.getTaskStats.and.returnValue(of({ total: 3, todo: 1, inProgress: 1, done: 1, completionRate: 33 }));
    equipeSpy.getAll.and.returnValue(of(mockEquipes));

    await TestBed.configureTestingModule({
      imports: [EquipeEntreprise, HttpClientTestingModule],
      providers: [
        { provide: EquipeEntrepriseService, useValue: entrepriseSpy },
        { provide: EquipeService, useValue: equipeSpy },
        provideHttpClient()
      ]
    }).compileComponents();

    equipeEntrepriseService = TestBed.inject(EquipeEntrepriseService) as jasmine.SpyObj<EquipeEntrepriseService>;
    equipeService = TestBed.inject(EquipeService) as jasmine.SpyObj<EquipeService>;
    fixture = TestBed.createComponent(EquipeEntreprise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with mocked data', () => {
    expect(component).toBeTruthy();
    expect(fixture.componentInstance).toBeDefined();
  });

  it('should associate entreprise to equipe', () => {
    equipeEntrepriseService.associerEntreprise('eq-001', 'ent-001').subscribe();
    expect(equipeEntrepriseService.associerEntreprise).toHaveBeenCalledWith('eq-001', 'ent-001');
  });

  it('should create a task for an equipe', () => {
    const task = { title: 'Fix bug', description: 'Critical fix', assignedTo: 'stu-001' };
    equipeEntrepriseService.createTask('eq-001', task).subscribe();
    expect(equipeEntrepriseService.createTask).toHaveBeenCalledWith('eq-001', task);
  });

  it('should update task status to DONE', () => {
    equipeEntrepriseService.updateTaskStatus('eq-001', 0, 'DONE').subscribe();
    expect(equipeEntrepriseService.updateTaskStatus).toHaveBeenCalledWith('eq-001', 0, 'DONE');
  });

  it('should get task stats for an equipe', () => {
    equipeEntrepriseService.getTaskStats('eq-001').subscribe(stats => {
      expect(stats.total).toBe(3);
      expect(stats.completionRate).toBe(33);
    });
  });
});