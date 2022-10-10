import { TestBed } from '@angular/core/testing';

import { sampleWithRequiredData, sampleWithNewData } from '../random-saying.test-samples';

import { RandomSayingFormService } from './random-saying-form.service';

describe('RandomSaying Form Service', () => {
  let service: RandomSayingFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomSayingFormService);
  });

  describe('Service methods', () => {
    describe('createRandomSayingFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createRandomSayingFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            creationDate: expect.any(Object),
          })
        );
      });

      it('passing IRandomSaying should create a new form with FormGroup', () => {
        const formGroup = service.createRandomSayingFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            content: expect.any(Object),
            creationDate: expect.any(Object),
          })
        );
      });
    });

    describe('getRandomSaying', () => {
      it('should return NewRandomSaying for default RandomSaying initial value', () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const formGroup = service.createRandomSayingFormGroup(sampleWithNewData);

        const randomSaying = service.getRandomSaying(formGroup) as any;

        expect(randomSaying).toMatchObject(sampleWithNewData);
      });

      it('should return NewRandomSaying for empty RandomSaying initial value', () => {
        const formGroup = service.createRandomSayingFormGroup();

        const randomSaying = service.getRandomSaying(formGroup) as any;

        expect(randomSaying).toMatchObject({});
      });

      it('should return IRandomSaying', () => {
        const formGroup = service.createRandomSayingFormGroup(sampleWithRequiredData);

        const randomSaying = service.getRandomSaying(formGroup) as any;

        expect(randomSaying).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IRandomSaying should not enable id FormControl', () => {
        const formGroup = service.createRandomSayingFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewRandomSaying should disable id FormControl', () => {
        const formGroup = service.createRandomSayingFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
