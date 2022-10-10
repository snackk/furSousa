import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { RandomSayingDetailComponent } from './random-saying-detail.component';

describe('RandomSaying Management Detail Component', () => {
  let comp: RandomSayingDetailComponent;
  let fixture: ComponentFixture<RandomSayingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RandomSayingDetailComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ randomSaying: { id: 123 } }) },
        },
      ],
    })
      .overrideTemplate(RandomSayingDetailComponent, '')
      .compileComponents();
    fixture = TestBed.createComponent(RandomSayingDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('Should load randomSaying on init', () => {
      // WHEN
      comp.ngOnInit();

      // THEN
      expect(comp.randomSaying).toEqual(expect.objectContaining({ id: 123 }));
    });
  });
});
