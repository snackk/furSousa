import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, from } from 'rxjs';

import { TributeFormService } from './tribute-form.service';
import { TributeService } from '../service/tribute.service';
import { ITribute } from '../tribute.model';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { TributeUpdateComponent } from './tribute-update.component';

describe('Tribute Management Update Component', () => {
  let comp: TributeUpdateComponent;
  let fixture: ComponentFixture<TributeUpdateComponent>;
  let activatedRoute: ActivatedRoute;
  let tributeFormService: TributeFormService;
  let tributeService: TributeService;
  let userService: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [TributeUpdateComponent],
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
      .overrideTemplate(TributeUpdateComponent, '')
      .compileComponents();

    fixture = TestBed.createComponent(TributeUpdateComponent);
    activatedRoute = TestBed.inject(ActivatedRoute);
    tributeFormService = TestBed.inject(TributeFormService);
    tributeService = TestBed.inject(TributeService);
    userService = TestBed.inject(UserService);

    comp = fixture.componentInstance;
  });

  describe('ngOnInit', () => {
    it('Should call User query and add missing value', () => {
      const tribute: ITribute = { id: 456 };
      const user: IUser = { id: 14375 };
      tribute.user = user;

      const userCollection: IUser[] = [{ id: 85715 }];
      jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
      const additionalUsers = [user];
      const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
      jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

      activatedRoute.data = of({ tribute });
      comp.ngOnInit();

      expect(userService.query).toHaveBeenCalled();
      expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(
        userCollection,
        ...additionalUsers.map(expect.objectContaining)
      );
      expect(comp.usersSharedCollection).toEqual(expectedCollection);
    });

    it('Should update editForm', () => {
      const tribute: ITribute = { id: 456 };
      const user: IUser = { id: 15932 };
      tribute.user = user;

      activatedRoute.data = of({ tribute });
      comp.ngOnInit();

      expect(comp.usersSharedCollection).toContain(user);
      expect(comp.tribute).toEqual(tribute);
    });
  });

  describe('save', () => {
    it('Should call update service on save for existing entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITribute>>();
      const tribute = { id: 123 };
      jest.spyOn(tributeFormService, 'getTribute').mockReturnValue(tribute);
      jest.spyOn(tributeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tribute });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tribute }));
      saveSubject.complete();

      // THEN
      expect(tributeFormService.getTribute).toHaveBeenCalled();
      expect(comp.previousState).toHaveBeenCalled();
      expect(tributeService.update).toHaveBeenCalledWith(expect.objectContaining(tribute));
      expect(comp.isSaving).toEqual(false);
    });

    it('Should call create service on save for new entity', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITribute>>();
      const tribute = { id: 123 };
      jest.spyOn(tributeFormService, 'getTribute').mockReturnValue({ id: null });
      jest.spyOn(tributeService, 'create').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tribute: null });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.next(new HttpResponse({ body: tribute }));
      saveSubject.complete();

      // THEN
      expect(tributeFormService.getTribute).toHaveBeenCalled();
      expect(tributeService.create).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).toHaveBeenCalled();
    });

    it('Should set isSaving to false on error', () => {
      // GIVEN
      const saveSubject = new Subject<HttpResponse<ITribute>>();
      const tribute = { id: 123 };
      jest.spyOn(tributeService, 'update').mockReturnValue(saveSubject);
      jest.spyOn(comp, 'previousState');
      activatedRoute.data = of({ tribute });
      comp.ngOnInit();

      // WHEN
      comp.save();
      expect(comp.isSaving).toEqual(true);
      saveSubject.error('This is an error!');

      // THEN
      expect(tributeService.update).toHaveBeenCalled();
      expect(comp.isSaving).toEqual(false);
      expect(comp.previousState).not.toHaveBeenCalled();
    });
  });

  describe('Compare relationships', () => {
    describe('compareUser', () => {
      it('Should forward to userService', () => {
        const entity = { id: 123 };
        const entity2 = { id: 456 };
        jest.spyOn(userService, 'compareUser');
        comp.compareUser(entity, entity2);
        expect(userService.compareUser).toHaveBeenCalledWith(entity, entity2);
      });
    });
  });
});
