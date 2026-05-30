import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { CandidatureService } from './candidature.service';
import { Candidature } from '../models/candidature.model';
import { environment } from '../../../environments/environment';

describe('CandidatureService', () => {
  let service: CandidatureService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/candidatures`;

  const candidature: Candidature = {
    idCandidature: 'cand-1',
    nomCandidat: 'Candidat',
    prenomCandidat: 'Test',
    email: 'student@b2u.tn',
    telephone: '22111222',
    anneeExperience: 1,
    statutCandidature: 'En cours',
    projectId: 'project-1',
    projectTitle: 'Plateforme B2U',
    companyId: 'company-1',
    companyName: 'B2U Company',
    scoreMatching: 74
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CandidatureService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CandidatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('recupere toutes les candidatures', () => {
    service.getAll().subscribe(result => {
      expect(result).toEqual([candidature]);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([candidature]);
  });

  it('convertit la page backend en structure simple pour le front', () => {
    service.getPaged(2, 5).subscribe(result => {
      expect(result.items).toEqual([candidature]);
      expect(result.total).toBe(1);
    });

    const req = httpMock.expectOne(request =>
      request.method === 'GET'
      && request.url === `${apiUrl}/paged`
      && request.params.get('page') === '2'
      && request.params.get('size') === '5'
    );
    req.flush({
      content: [candidature],
      totalElements: 1,
      totalPages: 1,
      size: 5,
      number: 2
    });
  });

  it('cree une candidature JSON sans fichiers', () => {
    service.create(candidature).subscribe(result => {
      expect(result.idCandidature).toBe('cand-1');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(candidature);
    req.flush(candidature);
  });

  it('cree une candidature multipart avec CV et lettre', () => {
    const cv = new File(['cv'], 'cv.pdf', { type: 'application/pdf' });
    const lettre = new File(['lettre'], 'lettre.pdf', { type: 'application/pdf' });
    const dto = {
      ...candidature,
      idCandidature: undefined
    };

    service.createWithFiles(dto, cv, lettre).subscribe(result => {
      expect(result).toEqual(candidature);
    });

    const req = httpMock.expectOne(`${apiUrl}/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();

    const formData = req.request.body as FormData;
    expect(formData.get('cv')).toBe(cv);
    expect(formData.get('lettre')).toBe(lettre);
    expect(formData.get('projectId')).toBe('project-1');
    expect(JSON.parse(formData.get('data') as string).email).toBe('student@b2u.tn');
    req.flush(candidature);
  });

  it('recupere les statistiques de matching du projet', () => {
    service.getStats('project-1').subscribe(stats => {
      expect(stats['totalCandidates']).toBe(3);
      expect(stats['topScore']).toBe(92);
    });

    const req = httpMock.expectOne(`${apiUrl}/project/project-1/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalCandidates: 3, topScore: 92 });
  });
});
