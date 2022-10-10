import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { ITribute, NewTribute } from '../tribute.model';

export type PartialUpdateTribute = Partial<ITribute> & Pick<ITribute, 'id'>;

type RestOf<T extends ITribute | NewTribute> = Omit<T, 'creationDate'> & {
  creationDate?: string | null;
};

export type RestTribute = RestOf<ITribute>;

export type NewRestTribute = RestOf<NewTribute>;

export type PartialUpdateRestTribute = RestOf<PartialUpdateTribute>;

export type EntityResponseType = HttpResponse<ITribute>;
export type EntityArrayResponseType = HttpResponse<ITribute[]>;

@Injectable({ providedIn: 'root' })
export class TributeService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/tributes');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(tribute: NewTribute): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tribute);
    return this.http
      .post<RestTribute>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(tribute: ITribute): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tribute);
    return this.http
      .put<RestTribute>(`${this.resourceUrl}/${this.getTributeIdentifier(tribute)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(tribute: PartialUpdateTribute): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(tribute);
    return this.http
      .patch<RestTribute>(`${this.resourceUrl}/${this.getTributeIdentifier(tribute)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestTribute>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestTribute[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getTributeIdentifier(tribute: Pick<ITribute, 'id'>): number {
    return tribute.id;
  }

  compareTribute(o1: Pick<ITribute, 'id'> | null, o2: Pick<ITribute, 'id'> | null): boolean {
    return o1 && o2 ? this.getTributeIdentifier(o1) === this.getTributeIdentifier(o2) : o1 === o2;
  }

  addTributeToCollectionIfMissing<Type extends Pick<ITribute, 'id'>>(
    tributeCollection: Type[],
    ...tributesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const tributes: Type[] = tributesToCheck.filter(isPresent);
    if (tributes.length > 0) {
      const tributeCollectionIdentifiers = tributeCollection.map(tributeItem => this.getTributeIdentifier(tributeItem)!);
      const tributesToAdd = tributes.filter(tributeItem => {
        const tributeIdentifier = this.getTributeIdentifier(tributeItem);
        if (tributeCollectionIdentifiers.includes(tributeIdentifier)) {
          return false;
        }
        tributeCollectionIdentifiers.push(tributeIdentifier);
        return true;
      });
      return [...tributesToAdd, ...tributeCollection];
    }
    return tributeCollection;
  }

  protected convertDateFromClient<T extends ITribute | NewTribute | PartialUpdateTribute>(tribute: T): RestOf<T> {
    return {
      ...tribute,
      creationDate: tribute.creationDate?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restTribute: RestTribute): ITribute {
    return {
      ...restTribute,
      creationDate: restTribute.creationDate ? dayjs(restTribute.creationDate) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestTribute>): HttpResponse<ITribute> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestTribute[]>): HttpResponse<ITribute[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
