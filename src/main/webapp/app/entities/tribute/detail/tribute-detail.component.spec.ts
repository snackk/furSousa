import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { TributeDetailComponent } from './tribute-detail.component';

describe('Tribute Management Detail Component', () => {
  let comp: TributeDetailComponent;
  let fixture: ComponentFixture<TributeDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TributeDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ tribute: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(TributeDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(TributeDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load tribute on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.tribute).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
