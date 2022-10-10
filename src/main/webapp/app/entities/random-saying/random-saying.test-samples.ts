import dayjs from 'dayjs/esm';

import { IRandomSaying, NewRandomSaying } from './random-saying.model';

export const sampleWithRequiredData: IRandomSaying = {
  id: 55242,
  content: 'Polarised',
};

export const sampleWithPartialData: IRandomSaying = {
  id: 41447,
  content: 'Tactics Cotton',
  creationDate: dayjs('2022-10-10T04:18'),
};

export const sampleWithFullData: IRandomSaying = {
  id: 79215,
  content: 'Texas',
  creationDate: dayjs('2022-10-10T13:08'),
};

export const sampleWithNewData: NewRandomSaying = {
  content: 'Pula interface',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
