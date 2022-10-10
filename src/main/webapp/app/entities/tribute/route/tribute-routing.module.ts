import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { TributeComponent } from '../list/tribute.component';
import { TributeDetailComponent } from '../detail/tribute-detail.component';
import { TributeUpdateComponent } from '../update/tribute-update.component';
import { TributeRoutingResolveService } from './tribute-routing-resolve.service';
import { ASC } from 'app/config/navigation.constants';

const tributeRoute: Routes = [
  {
    path: '',
    component: TributeComponent,
    data: {
      defaultSort: 'id,' + ASC,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: TributeDetailComponent,
    resolve: {
      tribute: TributeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: TributeUpdateComponent,
    resolve: {
      tribute: TributeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: TributeUpdateComponent,
    resolve: {
      tribute: TributeRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(tributeRoute)],
  exports: [RouterModule],
})
export class TributeRoutingModule {}
