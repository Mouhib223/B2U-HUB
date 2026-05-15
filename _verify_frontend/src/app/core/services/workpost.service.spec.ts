import { TestBed } from '@angular/core/testing';

import { WorkPostService } from './workpost.service';

describe('Workpost', () => {
  let service: WorkPostService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkPostService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
