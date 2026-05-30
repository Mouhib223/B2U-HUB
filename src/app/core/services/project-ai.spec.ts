import { TestBed } from '@angular/core/testing';

import { ProjectAiService } from './project-ai';

describe('ProjectAiService', () => {
  let service: ProjectAiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectAiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
