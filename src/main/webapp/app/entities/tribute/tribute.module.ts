import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { TributeComponent } from './list/tribute.component';
import { TributeDetailComponent } from './detail/tribute-detail.component';
import { TributeUpdateComponent } from './update/tribute-update.component';
import { TributeDeleteDialogComponent } from './delete/tribute-delete-dialog.component';
import { TributeRoutingModule } from './route/tribute-routing.module';

@NgModule({
  imports: [SharedModule, TributeRoutingModule],
  declarations: [TributeComponent, TributeDetailComponent, TributeUpdateComponent, TributeDeleteDialogComponent],
})
export class TributeModule {}
