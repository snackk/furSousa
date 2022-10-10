import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { IRandomSaying, NewRandomSaying } from '../random-saying.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IRandomSaying for edit and NewRandomSayingFormGroupInput for create.
 */
type RandomSayingFormGroupInput = IRandomSaying | PartialWithRequiredKeyOf<NewRandomSaying>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends IRandomSaying | NewRandomSaying> = Omit<T, 'creationDate'> & {
  creationDate?: string | null;
};

type RandomSayingFormRawValue = FormValueOf<IRandomSaying>;

type NewRandomSayingFormRawValue = FormValueOf<NewRandomSaying>;

type RandomSayingFormDefaults = Pick<NewRandomSaying, 'id' | 'creationDate'>;

type RandomSayingFormGroupContent = {
  id: FormControl<RandomSayingFormRawValue['id'] | NewRandomSaying['id']>;
  content: FormControl<RandomSayingFormRawValue['content']>;
  creationDate: FormControl<RandomSayingFormRawValue['creationDate']>;
};

export type RandomSayingFormGroup = FormGroup<RandomSayingFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class RandomSayingFormService {
  createRandomSayingFormGroup(randomSaying: RandomSayingFormGroupInput = { id: null }): RandomSayingFormGroup {
    const randomSayingRawValue = this.convertRandomSayingToRandomSayingRawValue({
      ...this.getFormDefaults(),
      ...randomSaying,
    });
    return new FormGroup<RandomSayingFormGroupContent>({
      id: new FormControl(
        { value: randomSayingRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      content: new FormControl(randomSayingRawValue.content, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      creationDate: new FormControl(randomSayingRawValue.creationDate),
    });
  }

  getRandomSaying(form: RandomSayingFormGroup): IRandomSaying | NewRandomSaying {
    return this.convertRandomSayingRawValueToRandomSaying(form.getRawValue() as RandomSayingFormRawValue | NewRandomSayingFormRawValue);
  }

  resetForm(form: RandomSayingFormGroup, randomSaying: RandomSayingFormGroupInput): void {
    const randomSayingRawValue = this.convertRandomSayingToRandomSayingRawValue({ ...this.getFormDefaults(), ...randomSaying });
    form.reset(
      {
        ...randomSayingRawValue,
        id: { value: randomSayingRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): RandomSayingFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      creationDate: currentTime,
    };
  }

  private convertRandomSayingRawValueToRandomSaying(
    rawRandomSaying: RandomSayingFormRawValue | NewRandomSayingFormRawValue
  ): IRandomSaying | NewRandomSaying {
    return {
      ...rawRandomSaying,
      creationDate: dayjs(rawRandomSaying.creationDate, DATE_TIME_FORMAT),
    };
  }

  private convertRandomSayingToRandomSayingRawValue(
    randomSaying: IRandomSaying | (Partial<NewRandomSaying> & RandomSayingFormDefaults)
  ): RandomSayingFormRawValue | PartialWithRequiredKeyOf<NewRandomSayingFormRawValue> {
    return {
      ...randomSaying,
      creationDate: randomSaying.creationDate ? randomSaying.creationDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
