import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { RandomSayingComponent } from './list/random-saying.component';
import { RandomSayingDetailComponent } from './detail/random-saying-detail.component';
import { RandomSayingUpdateComponent } from './update/random-saying-update.component';
import { RandomSayingDeleteDialogComponent } from './delete/random-saying-delete-dialog.component';
import { RandomSayingRoutingModule } from './route/random-saying-routing.module';

@NgModule({
  imports: [SharedModule, RandomSayingRoutingModule],
  declarations: [RandomSayingComponent, RandomSayingDetailComponent, RandomSayingUpdateComponent, RandomSayingDeleteDialogComponent],
})
export class RandomSayingModule {}
