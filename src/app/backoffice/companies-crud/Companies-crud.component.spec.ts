import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CompaniesCrudComponent } from './companies-crud';
import { EntrepriseService, Entreprise } from '../../core/services/entreprise.service';

// ── mock Chart.js (Jasmine-compatible, NOT Jest) ─────────────────────────
beforeEach(() => {
  (window as any).Chart = class {
    static register() {}
    destroy() {}
  };
});

const mockCompany: Entreprise = {
  id: 'ent-001',
  name: 'TechCorp',
  sector: 'IT',
  address: 'Tunis',
  email: 'contact@techcorp.tn',
  phone: '12345678'
};

const mockEntrepriseService = {
  getAll: jasmine.createSpy('getAll'),
  getTotalCount: jasmine.createSpy('getTotalCount'),
  getCountBySector: jasmine.createSpy('getCountBySector'),
  add: jasmine.createSpy('add'),
  update: jasmine.createSpy('update'),
  delete: jasmine.createSpy('delete'),
  getEquipesByEntreprise: jasmine.createSpy('getEquipesByEntreprise'),
  getSimilar: jasmine.createSpy('getSimilar')
};

describe('CompaniesCrudComponent — Tests fonctionnels', () => {
  let component: CompaniesCrudComponent;
  let fixture: ComponentFixture<CompaniesCrudComponent>;

  beforeEach(async () => {
    mockEntrepriseService.getAll.and.returnValue(of([mockCompany]));
    mockEntrepriseService.getTotalCount.and.returnValue(of({ total: 1 }));
    mockEntrepriseService.getCountBySector.and.returnValue(of({ IT: 1 }));

    await TestBed.configureTestingModule({
      imports: [CompaniesCrudComponent, CommonModule, FormsModule],
      providers: [
        { provide: EntrepriseService, useValue: mockEntrepriseService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompaniesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockEntrepriseService.getAll.calls.reset();
    mockEntrepriseService.getTotalCount.calls.reset();
    mockEntrepriseService.getCountBySector.calls.reset();
    mockEntrepriseService.add.calls.reset();
    mockEntrepriseService.update.calls.reset();
    mockEntrepriseService.delete.calls.reset();
    mockEntrepriseService.getEquipesByEntreprise.calls.reset();
  });

  it('ngOnInit() charge la liste des entreprises au démarrage', () => {
    expect(mockEntrepriseService.getAll).toHaveBeenCalled();
    expect(component.companies.length).toBe(1);
  });

  it('ngOnInit() charge les stats au démarrage', () => {
    expect(mockEntrepriseService.getTotalCount).toHaveBeenCalled();
    expect(mockEntrepriseService.getCountBySector).toHaveBeenCalled();
  });

  it('ngOnInit() remplit sectorBreakdown correctement', () => {
    expect(component.sectorBreakdown).toEqual([{ sector: 'IT', count: 1 }]);
  });

  it('ngOnInit() remet les stats à 0 si le backend échoue', fakeAsync(() => {
    mockEntrepriseService.getTotalCount.and.returnValue(throwError(() => new Error('err')));
    mockEntrepriseService.getCountBySector.and.returnValue(throwError(() => new Error('err')));

    component.loadStats();
    tick();

    expect(component.stats[0].value).toBe(0);
    expect(component.sectorBreakdown).toEqual([]);
  }));

  it('filteredCompanies retourne toutes les entreprises si searchQuery est vide', () => {
    component.searchQuery = '';
    expect(component.filteredCompanies.length).toBe(1);
  });

  it('filteredCompanies filtre par name (insensible à la casse)', () => {
    component.searchQuery = 'tech';
    expect(component.filteredCompanies.length).toBe(1);
  });

  it('openAddModal() ouvre le modal et reset le formulaire', () => {
    component.newCompany = { name: 'Old', email: 'x', phone: 'x', address: 'x', sector: 'x' };
    component.openAddModal();

    expect(component.showAddModal).toBeTrue();
    expect(component.newCompany.name).toBe('');
  });

  it('addCompany() appelle add() et recharge la liste', fakeAsync(() => {
    mockEntrepriseService.add.and.returnValue(of({}));

    component.newCompany = {
      name: 'NewCorp',
      email: 'new@corp.tn',
      phone: '22334455',
      address: 'Sfax',
      sector: 'Finance'
    };

    component.addCompany();
    tick();

    expect(mockEntrepriseService.add).toHaveBeenCalled();
    expect(component.showAddModal).toBeFalse();
  }));

  it('openEditModal() copie les données correctement', () => {
    component.openEditModal(mockCompany);

    expect(component.editingCompany).toEqual(mockCompany);
    expect(component.editingCompany).not.toBe(mockCompany);
  });

  it('updateCompany() appelle update()', fakeAsync(() => {
    mockEntrepriseService.update.and.returnValue(of({}));

    component.editingCompany = { ...mockCompany };
    component.updateCompany();
    tick();

    expect(mockEntrepriseService.update).toHaveBeenCalled();
  }));

  it('deleteCompany() supprime une entreprise', fakeAsync(() => {
    mockEntrepriseService.delete.and.returnValue(of({}));

    component.companies = [mockCompany];
    component.selectedCompany = mockCompany;

    component.deleteCompany();
    tick();

    expect(mockEntrepriseService.delete).toHaveBeenCalled();
    expect(component.companies.length).toBe(0);
  }));

  it('toggleEquipes() charge les équipes', fakeAsync(() => {
    const equipes = [{ id: 'eq-1', name: 'Team Alpha' }];
    mockEntrepriseService.getEquipesByEntreprise.and.returnValue(of(equipes));

    component.toggleEquipes('ent-001');
    tick();

    expect(component.equipesByCompany['ent-001']).toEqual(equipes);
  }));
});