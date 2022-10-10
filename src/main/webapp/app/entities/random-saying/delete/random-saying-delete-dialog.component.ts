import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IRandomSaying } from '../random-saying.model';
import { RandomSayingService } from '../service/random-saying.service';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';

@Component({
  templateUrl: './random-saying-delete-dialog.component.html',
})
export class RandomSayingDeleteDialogComponent {
  randomSaying?: IRandomSaying;

  constructor(protected randomSayingService: RandomSayingService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.randomSayingService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
