import { TestBed } from '@angular/core/testing';

import { ProjectAi } from './project-ai';

describe('ProjectAi', () => {
  let service: ProjectAi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectAi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
