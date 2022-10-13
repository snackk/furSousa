import { Injectable } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import dayjs from 'dayjs/esm';
import { DATE_TIME_FORMAT } from 'app/config/input.constants';
import { ITribute, NewTribute } from '../tribute.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts ITribute for edit and NewTributeFormGroupInput for create.
 */
type TributeFormGroupInput = ITribute | PartialWithRequiredKeyOf<NewTribute>;

/**
 * Type that converts some properties for forms.
 */
type FormValueOf<T extends ITribute | NewTribute> = Omit<T, 'creationDate'> & {
  creationDate?: string | null;
};

type TributeFormRawValue = FormValueOf<ITribute>;

type NewTributeFormRawValue = FormValueOf<NewTribute>;

type TributeFormDefaults = Pick<NewTribute, 'id' | 'creationDate'>;

type TributeFormGroupContent = {
  id: FormControl<TributeFormRawValue['id'] | NewTribute['id']>;
  content: FormControl<TributeFormRawValue['content']>;
  creationDate: FormControl<TributeFormRawValue['creationDate']>;
};

export type TributeFormGroup = FormGroup<TributeFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class TributeFormService {
  createTributeFormGroup(tribute: TributeFormGroupInput = { id: null }): TributeFormGroup {
    const tributeRawValue = this.convertTributeToTributeRawValue({
      ...this.getFormDefaults(),
      ...tribute,
    });
    return new FormGroup<TributeFormGroupContent>({
      id: new FormControl(
        { value: tributeRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
      content: new FormControl(tributeRawValue.content, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      creationDate: new FormControl(tributeRawValue.creationDate),
    });
  }

  getTribute(form: TributeFormGroup): ITribute | NewTribute {
    return this.convertTributeRawValueToTribute(form.getRawValue() as TributeFormRawValue | NewTributeFormRawValue);
  }

  resetForm(form: TributeFormGroup, tribute: TributeFormGroupInput): void {
    const tributeRawValue = this.convertTributeToTributeRawValue({ ...this.getFormDefaults(), ...tribute });
    form.reset(
      {
        ...tributeRawValue,
        id: { value: tributeRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */
    );
  }

  private getFormDefaults(): TributeFormDefaults {
    const currentTime = dayjs();

    return {
      id: null,
      creationDate: currentTime,
    };
  }

  private convertTributeRawValueToTribute(rawTribute: TributeFormRawValue | NewTributeFormRawValue): ITribute | NewTribute {
    return {
      ...rawTribute,
      creationDate: dayjs(rawTribute.creationDate, DATE_TIME_FORMAT),
    };
  }

  private convertTributeToTributeRawValue(
    tribute: ITribute | (Partial<NewTribute> & TributeFormDefaults)
  ): TributeFormRawValue | PartialWithRequiredKeyOf<NewTributeFormRawValue> {
    return {
      ...tribute,
      creationDate: tribute.creationDate ? tribute.creationDate.format(DATE_TIME_FORMAT) : undefined,
    };
  }
}
