import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import {  EquipeService } from './equipe.service';

describe('Equipe', () => {
  let service:EquipeService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule],
  providers: [EquipeService, provideHttpClient()]});
    service = TestBed.inject(EquipeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
