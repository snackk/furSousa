import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IRandomSaying, NewRandomSaying } from '../random-saying.model';

export type PartialUpdateRandomSaying = Partial<IRandomSaying> & Pick<IRandomSaying, 'id'>;

type RestOf<T extends IRandomSaying | NewRandomSaying> = Omit<T, 'creationDate'> & {
  creationDate?: string | null;
};

export type RestRandomSaying = RestOf<IRandomSaying>;

export type NewRestRandomSaying = RestOf<NewRandomSaying>;

export type PartialUpdateRestRandomSaying = RestOf<PartialUpdateRandomSaying>;

export type EntityResponseType = HttpResponse<IRandomSaying>;
export type EntityArrayResponseType = HttpResponse<IRandomSaying[]>;

@Injectable({ providedIn: 'root' })
export class RandomSayingService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/random-sayings');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(randomSaying: NewRandomSaying): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(randomSaying);
    return this.http
      .post<RestRandomSaying>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(randomSaying: IRandomSaying): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(randomSaying);
    return this.http
      .put<RestRandomSaying>(`${this.resourceUrl}/${this.getRandomSayingIdentifier(randomSaying)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(randomSaying: PartialUpdateRandomSaying): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(randomSaying);
    return this.http
      .patch<RestRandomSaying>(`${this.resourceUrl}/${this.getRandomSayingIdentifier(randomSaying)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestRandomSaying>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestRandomSaying[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getRandomSayingIdentifier(randomSaying: Pick<IRandomSaying, 'id'>): number {
    return randomSaying.id;
  }

  compareRandomSaying(o1: Pick<IRandomSaying, 'id'> | null, o2: Pick<IRandomSaying, 'id'> | null): boolean {
    return o1 && o2 ? this.getRandomSayingIdentifier(o1) === this.getRandomSayingIdentifier(o2) : o1 === o2;
  }

  addRandomSayingToCollectionIfMissing<Type extends Pick<IRandomSaying, 'id'>>(
    randomSayingCollection: Type[],
    ...randomSayingsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const randomSayings: Type[] = randomSayingsToCheck.filter(isPresent);
    if (randomSayings.length > 0) {
      const randomSayingCollectionIdentifiers = randomSayingCollection.map(
        randomSayingItem => this.getRandomSayingIdentifier(randomSayingItem)!
      );
      const randomSayingsToAdd = randomSayings.filter(randomSayingItem => {
        const randomSayingIdentifier = this.getRandomSayingIdentifier(randomSayingItem);
        if (randomSayingCollectionIdentifiers.includes(randomSayingIdentifier)) {
          return false;
        }
        randomSayingCollectionIdentifiers.push(randomSayingIdentifier);
        return true;
      });
      return [...randomSayingsToAdd, ...randomSayingCollection];
    }
    return randomSayingCollection;
  }

  protected convertDateFromClient<T extends IRandomSaying | NewRandomSaying | PartialUpdateRandomSaying>(randomSaying: T): RestOf<T> {
    return {
      ...randomSaying,
      creationDate: randomSaying.creationDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restRandomSaying: RestRandomSaying): IRandomSaying {
    return {
      ...restRandomSaying,
      creationDate: restRandomSaying.creationDate ? dayjs(restRandomSaying.creationDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestRandomSaying>): HttpResponse<IRandomSaying> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestRandomSaying[]>): HttpResponse<IRandomSaying[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
