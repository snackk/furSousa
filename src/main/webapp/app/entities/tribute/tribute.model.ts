import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';

export interface ITribute {
  id: number;
  content?: string | null;
  creationDate?: dayjs.Dayjs | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewTribute = Omit<ITribute, 'id'> & { id: null };
