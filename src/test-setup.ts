import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);

const defaultActivatedRoute = {
  snapshot: {
    paramMap: convertToParamMap({}),
    queryParamMap: convertToParamMap({})
  },
  params: of({}),
  queryParams: of({}),
  data: of({})
};

TestBed.configureTestingModule = (moduleDef: any = {}) =>
  originalConfigureTestingModule({
    ...moduleDef,
    imports: [NoopAnimationsModule, ...(moduleDef.imports ?? [])],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: ActivatedRoute, useValue: defaultActivatedRoute },
      ...(moduleDef.providers ?? [])
    ]
  });

beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      { provide: ActivatedRoute, useValue: defaultActivatedRoute }
    ]
  });
});
