import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IRandomSaying } from '../random-saying.model';
import { RandomSayingService } from '../service/random-saying.service';

@Injectable({ providedIn: 'root' })
export class RandomSayingRoutingResolveService implements Resolve<IRandomSaying | null> {
  constructor(protected service: RandomSayingService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IRandomSaying | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((randomSaying: HttpResponse<IRandomSaying>) => {
          if (randomSaying.body) {
            return of(randomSaying.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(null);
  }
}
