import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { RandomSayingComponent } from '../list/random-saying.component';
import { RandomSayingDetailComponent } from '../detail/random-saying-detail.component';
import { RandomSayingUpdateComponent } from '../update/random-saying-update.component';
import { RandomSayingRoutingResolveService } from './random-saying-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const randomSayingRoute: Routes = [
  {
    path: '',
    component: RandomSayingComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: RandomSayingDetailComponent,
    resolve: {
      randomSaying: RandomSayingRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: RandomSayingUpdateComponent,
    resolve: {
      randomSaying: RandomSayingRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: RandomSayingUpdateComponent,
    resolve: {
      randomSaying: RandomSayingRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(randomSayingRoute)],
  exports: [RouterModule],
})
export class RandomSayingRoutingModule {}
