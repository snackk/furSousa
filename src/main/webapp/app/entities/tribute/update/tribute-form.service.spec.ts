import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../tribute.test-samples';

import { TributeFormService } from './tribute-form.service';

describe('Tribute Form Service', () => {
  let service: TributeFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TributeFormService);
  });

  describe('Service methods', () => {
    describe('createTributeFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createTributeFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            creationDate: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });

      it('passing ITribute should create a new form with FormGroup', () => {
        const formGroup = service.createTributeFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            creationDate: expect.any(Object),
            user: expect.any(Object),
          })
        );
      });
    });

    describe('getTribute', () => {
      it('should return NewTribute for default Tribute initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createTributeFormGroup(sampleWithNewData);

        const tribute = service.getTribute(formGroup) as any;

        expect(tribute).toMatchObject(sampleWithNewData);
      });

      it('should return NewTribute for empty Tribute initial value', () => {
        const formGroup = service.createTributeFormGroup();

        const tribute = service.getTribute(formGroup) as any;

        expect(tribute).toMatchObject({});
      });

      it('should return ITribute', () => {
        const formGroup = service.createTributeFormGroup(sampleWithRequiredData);

        const tribute = service.getTribute(formGroup) as any;

        expect(tribute).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing ITribute should not enable id FormControl', () => {
        const formGroup = service.createTributeFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewTribute should disable id FormControl', () => {
        const formGroup = service.createTributeFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
