import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { RandomSayingFormService, RandomSayingFormGroup } from './random-saying-form.service';
import { IRandomSaying } from '../random-saying.model';
import { RandomSayingService } from '../service/random-saying.service';

@Component({
  selector: 'jhi-random-saying-update',
  templateUrl: './random-saying-update.component.html',
})
export class RandomSayingUpdateComponent implements OnInit {
  isSaving = false;
  randomSaying: IRandomSaying | null = null;

  editForm: RandomSayingFormGroup = this.randomSayingFormService.createRandomSayingFormGroup();

  constructor(
    protected randomSayingService: RandomSayingService,
    protected randomSayingFormService: RandomSayingFormService,
    protected activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ randomSaying }) => {
      this.randomSaying = randomSaying;
      if (randomSaying) {
        this.updateForm(randomSaying);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const randomSaying = this.randomSayingFormService.getRandomSaying(this.editForm);
    if (randomSaying.id !== null) {
      this.subscribeToSaveResponse(this.randomSayingService.update(randomSaying));
    } else {
      this.subscribeToSaveResponse(this.randomSayingService.create(randomSaying));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IRandomSaying>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(randomSaying: IRandomSaying): void {
    this.randomSaying = randomSaying;
    this.randomSayingFormService.resetForm(this.editForm, randomSaying);
  }
}
