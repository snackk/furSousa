import dayjs from 'dayjs/esm';

export interface IRandomSaying {
  id: number;
  content?: string | null;
  creationDate?: dayjs.Dayjs | null;
}

export type NewRandomSaying = Omit<IRandomSaying, 'id'> & { id: null };
