import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { EntrepriseService, Entreprise } from './entreprise.service';

const BASE = 'http://localhost:8080/api/entreprise';

const mockEntreprise: Entreprise = {
  id: 'ent-001',
  name: 'TechCorp',
  sector: 'IT',
  address: 'Tunis',
  email: 'contact@techcorp.tn',
  phone: '12345678'
};

describe('EntrepriseService - Tests unitaires', () => {
  let service: EntrepriseService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EntrepriseService]
    });
    service = TestBed.inject(EntrepriseService);
    http    = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // ── getAll ──────────────────────────────────────────────────────────────

  it('getAll() envoie GET /getAll et retourne la liste', () => {
    service.getAll().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('TechCorp');
    });

    const req = http.expectOne(`${BASE}/getAll`);
    expect(req.request.method).toBe('GET');
    req.flush([mockEntreprise]);
  });

  it('getAll() retourne un tableau vide si aucune entreprise', () => {
    service.getAll().subscribe(list => expect(list).toEqual([]));
    http.expectOne(`${BASE}/getAll`).flush([]);
  });

  // ── add ─────────────────────────────────────────────────────────────────

  it('add() envoie POST /add avec le bon body', () => {
    const payload = { name: 'NewCorp', sector: 'Finance',
                      email: 'new@corp.tn', phone: '22334455',
                      address: 'Sfax' };

    service.add(payload).subscribe();

    const req = http.expectOne('http://localhost:8080/api/entreprise/add');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('NewCorp');
    req.flush({ id: 'ent-002', ...payload });
  });

  it('add() propage une erreur 409 si le nom est déjà utilisé', () => {
    service.add({ name: 'TechCorp' }).subscribe({
      next: () => fail('doit échouer'),
      error: err => expect(err.status).toBe(409)
    });

    http.expectOne('http://localhost:8080/api/entreprise/add')
        .flush('Conflict', { status: 409, statusText: 'Conflict' });
  });

  // ── update ───────────────────────────────────────────────────────────────

  it('update() envoie PUT /update/:id avec les champs mis à jour', () => {
    const payload = { ...mockEntreprise, sector: 'FinTech' };

    service.update('ent-001', payload).subscribe(e => {
      expect(e.sector).toBe('FinTech');
    });

    const req = http.expectOne(`http://localhost:8080/api/entreprise/update/ent-001`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.sector).toBe('FinTech');
    req.flush({ ...mockEntreprise, sector: 'FinTech' });
  });

  it('update() propage une erreur 404 si l entreprise est introuvable', () => {
    service.update('xxx', mockEntreprise).subscribe({
      next: () => fail('doit échouer'),
      error: err => expect(err.status).toBe(404)
    });

    http.expectOne(`http://localhost:8080/api/entreprise/update/xxx`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  it('delete() envoie DELETE /delete/:id', () => {
    service.delete('ent-001').subscribe();

    const req = http.expectOne(`http://localhost:8080/api/entreprise/delete/ent-001`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('delete() propage une erreur 404 si l id est inconnu', () => {
    service.delete('xxx').subscribe({
      next: () => fail('doit échouer'),
      error: err => expect(err.status).toBe(404)
    });

    http.expectOne(`http://localhost:8080/api/entreprise/delete/xxx`)
        .flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  // ── getTotalCount ─────────────────────────────────────────────────────────

  it('getTotalCount() envoie GET /stats/total et retourne le total', () => {
    service.getTotalCount().subscribe(res => {
      expect(res.total).toBe(7);
    });

    const req = http.expectOne(`${BASE}/stats/total`);
    expect(req.request.method).toBe('GET');
    req.flush({ total: 7 });
  });

  // ── getCountBySector ─────────────────────────────────────────────────────

  it('getCountBySector() retourne un objet secteur → count', () => {
    service.getCountBySector().subscribe(stats => {
      expect(stats['IT']).toBe(5);
      expect(stats['Finance']).toBe(2);
    });

    const req = http.expectOne(`${BASE}/stats/by-sector`);
    expect(req.request.method).toBe('GET');
    req.flush({ IT: 5, Finance: 2 });
  });

  it('getCountBySector() retourne un objet vide si aucune entreprise', () => {
    service.getCountBySector().subscribe(stats => {
      expect(Object.keys(stats).length).toBe(0);
    });

    http.expectOne(`${BASE}/stats/by-sector`).flush({});
  });

  // ── getSimilar ────────────────────────────────────────────────────────────

  it('getSimilar() envoie GET /:id/similar et retourne les entreprises similaires', () => {
    const similar: Entreprise = { ...mockEntreprise, id: 'ent-002', name: 'CorpB' };

    service.getSimilar('ent-001').subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('ent-002');
      expect(list[0].sector).toBe('IT');
    });

    const req = http.expectOne(`${BASE}/ent-001/similar`);
    expect(req.request.method).toBe('GET');
    req.flush([similar]);
  });

  it('getSimilar() retourne une liste vide si aucune entreprise similaire', () => {
    service.getSimilar('ent-001').subscribe(list => expect(list).toEqual([]));
    http.expectOne(`${BASE}/ent-001/similar`).flush([]);
  });

  // ── getEquipesByEntreprise ────────────────────────────────────────────────

  it('getEquipesByEntreprise() envoie GET /:id/equipes', () => {
    const equipes = [{ id: 'eq-1', name: 'Team Alpha' }];

    service.getEquipesByEntreprise('ent-001').subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].name).toBe('Team Alpha');
    });

    const req = http.expectOne(`${BASE}/ent-001/equipes`);
    expect(req.request.method).toBe('GET');
    req.flush(equipes);
  });

  it('getEquipesByEntreprise() retourne liste vide si pas d equipes', () => {
    service.getEquipesByEntreprise('ent-001').subscribe(list => expect(list).toEqual([]));
    http.expectOne(`${BASE}/ent-001/equipes`).flush([]);
  });
});