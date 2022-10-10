import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { RandomSayingFormService } from './random-saying-form.service';
import { RandomSayingService } from '../service/random-saying.service';
import { IRandomSaying } from '../random-saying.model';

import { RandomSayingUpdateComponent } from './random-saying-update.component';

describe('RandomSaying Management Update Component', () => {
  let comp: RandomSayingUpdateComponent;
  let fixture: ComponentFixture<RandomSayingUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let randomSayingFormService: RandomSayingFormService;
  let randomSayingService: RandomSayingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [RandomSayingUpdateComponent],
      providers: [
        FormBuilder,
        {
          provide: ActivatedRoute,
          useValue: {
            params: from([{}]),
          },
        },
      ],
    })
      .overrideTemplate(RandomSayingUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(RandomSayingUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    randomSayingFormService = TestBed.inject(RandomSayingFormService);
    randomSayingService = TestBed.inject(RandomSayingService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should update editForm', () => {
      const randomSaying: IRandomSaying = { id: 456 };

      activatedRoute.data = of({ randomSaying });
      comp.ngOnInit();

      expect(comp.randomSaying).toEqual(randomSaying);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRandomSaying>>();
      const randomSaying = { id: 123 };
      jest.spyOn(randomSayingFormService, 'getRandomSaying').mockReturnValue(randomSaying);
      jest.spyOn(randomSayingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ randomSaying });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: randomSaying }));
      saveSubject.complete();

      // THEN
      expect(randomSayingFormService.getRandomSaying).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(randomSayingService.update).toHaveBeenCalledWith(expect.objectContaining(randomSaying));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRandomSaying>>();
      const randomSaying = { id: 123 };
      jest.spyOn(randomSayingFormService, 'getRandomSaying').mockReturnValue({ id: null });
      jest.spyOn(randomSayingService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ randomSaying: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: randomSaying }));
      saveSubject.complete();

      // THEN
      expect(randomSayingFormService.getRandomSaying).toHaveBeenCalled();
      expect(randomSayingService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<IRandomSaying>>();
      const randomSaying = { id: 123 };
      jest.spyOn(randomSayingService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ randomSaying });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(randomSayingService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });
});
