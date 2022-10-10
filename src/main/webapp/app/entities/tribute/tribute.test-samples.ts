import dayjs from 'dayjs/esm';

import { ITribute, NewTribute } from './tribute.model';

export const sampleWithRequiredData: ITribute = {
  id: 92945,
  content: 'robust Indiana',
};

export const sampleWithPartialData: ITribute = {
  id: 62292,
  content: 'dedicated Fantastic Pants',
  creationDate: dayjs('2022-10-10T11:36'),
};

export const sampleWithFullData: ITribute = {
  id: 34707,
  content: 'Oregon Intelligent',
  creationDate: dayjs('2022-10-10T10:07'),
};

export const sampleWithNewData: NewTribute = {
  content: 'Avon',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
