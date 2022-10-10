import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ITribute } from '../tribute.model';
import { TributeService } from '../service/tribute.service';

@Injectable({ providedIn: 'root' })
export class TributeRoutingResolveService implements Resolve<ITribute | null> {
  constructor(protected service: TributeService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<ITribute | null | never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((tribute: HttpResponse<ITribute>) => {
          if (tribute.body) {
            return of(tribute.body);
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
