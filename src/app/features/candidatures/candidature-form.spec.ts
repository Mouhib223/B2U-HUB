import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CandidatureFormComponent } from './candidature-form';
import { CandidatureService } from '../../core/services/candidature.service';
import { ProjectService } from '../../core/services/project.service';
import { AuthService } from '../../core/services/auth.service';
import { Project } from '../../core/models/project.model';

describe('CandidatureFormComponent', () => {
  let fixture: ComponentFixture<CandidatureFormComponent>;
  let component: CandidatureFormComponent;
  let candidatureService: jasmine.SpyObj<CandidatureService>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let authService: jasmine.SpyObj<AuthService>;

  const selectedProject: Project = {
    id: 'project-1',
    title: 'Plateforme B2U',
    description: 'Projet test',
    type: 'PROJET',
    status: 'open',
    companyId: 'company-1',
    companyName: 'B2U Company',
    technologies: ['Angular'],
    requiredSkills: ['Angular'],
    teamSize: 3,
    deadline: new Date('2026-06-30'),
    applicantsCount: 0,
    createdAt: new Date('2026-05-30')
  };

  beforeEach(async () => {
    candidatureService = jasmine.createSpyObj<CandidatureService>('CandidatureService', [
      'create',
      'createWithFiles'
    ]);
    projectService = jasmine.createSpyObj<ProjectService>('ProjectService', [
      'getProjectById',
      'getProjects'
    ]);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getCurrentUser']);

    projectService.getProjectById.and.returnValue(of(selectedProject));
    projectService.getProjects.and.returnValue(of([selectedProject]));
    authService.getCurrentUser.and.returnValue({
      id: 'student-1',
      firstName: 'Chtila',
      lastName: 'Test',
      email: 'student@b2u.tn',
      role: 'student',
      createdAt: new Date()
    });
    candidatureService.create.and.returnValue(of({ idCandidature: 'cand-1' } as any));
    candidatureService.createWithFiles.and.returnValue(of({ idCandidature: 'cand-1' } as any));

    await TestBed.configureTestingModule({
      imports: [CandidatureFormComponent],
      providers: [
        provideRouter([]),
        { provide: CandidatureService, useValue: candidatureService },
        { provide: ProjectService, useValue: projectService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'projectId' ? 'project-1' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidatureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('pre-remplit les informations utilisateur et le projet depuis la route', () => {
    expect(component.form.value.email).toBe('student@b2u.tn');
    expect(component.form.value.nomCandidat).toBe('Test');
    expect(component.form.value.prenomCandidat).toBe('Chtila');
    expect(component.form.value.projectId).toBe('project-1');
    expect(component.selectedProject?.title).toBe('Plateforme B2U');
  });

  it('bloque la soumission si le projet nest pas selectionne', () => {
    component.selectedProject = undefined;

    component.submit();

    expect(component.errorMessage).toBe('Veuillez selectionner un projet avant de soumettre.');
    expect(candidatureService.create).not.toHaveBeenCalled();
    expect(candidatureService.createWithFiles).not.toHaveBeenCalled();
  });

  it('valide uniquement les fichiers PDF de moins de 5MB', () => {
    const badType = new File(['text'], 'cv.txt', { type: 'text/plain' });
    const tooLarge = new File([new Uint8Array(component.MAX_SIZE + 1)], 'cv.pdf', {
      type: 'application/pdf'
    });
    const valid = new File(['pdf'], 'cv.pdf', { type: 'application/pdf' });

    expect(component.validatePdf(badType)).toBe('Le fichier doit etre un PDF');
    expect(component.validatePdf(tooLarge)).toBe('Taille maximale 5MB');
    expect(component.validatePdf(valid)).toBeNull();
  });

  it('cree une candidature JSON quand le formulaire est valide sans fichiers', () => {
    remplirFormulaireValide();

    component.submit();

    expect(candidatureService.create).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      email: 'student@b2u.tn',
      projectId: 'project-1',
      projectTitle: 'Plateforme B2U',
      companyId: 'company-1',
      statutCandidature: 'En cours'
    }));
    expect(component.success).toBeTrue();
  });

it('cree une candidature multipart quand CV et lettre sont presents', () => {
  remplirFormulaireValide();
  component.cvFile = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });
  component.lettreFile = new File(['lettre'], 'lettre.pdf', { type: 'application/pdf' });

  component.submit();

  expect(candidatureService.createWithFiles).toHaveBeenCalledWith(
    jasmine.any(FormData)
  );
  expect(component.success).toBeTrue();
});

  it('affiche le message backend en cas derreur de creation', () => {
    remplirFormulaireValide();
    candidatureService.create.and.returnValue(throwError(() => ({
      status: 400,
      error: { message: 'Candidature deja envoyee' }
    })));

    component.submit();

    expect(component.errorMessage).toBe('Erreur (400): Candidature deja envoyee');
  });

  function remplirFormulaireValide() {
    component.form.patchValue({
      nomCandidat: 'Test',
      prenomCandidat: 'Chtila',
      email: 'student@b2u.tn',
      telephone: '22111222',
      adresse: 'Tunis',
      formationActuelle: 'Master',
      specialite: 'DevOps',
      anneeExperience: 1,
      projectId: 'project-1',
      statutCandidature: 'En cours'
    });
  }
});
