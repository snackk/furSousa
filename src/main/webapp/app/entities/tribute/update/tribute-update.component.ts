import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { TributeFormService, TributeFormGroup } from './tribute-form.service';
import { ITribute } from '../tribute.model';
import { TributeService } from '../service/tribute.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-tribute-update',
  templateUrl: './tribute-update.component.html',
})
export class TributeUpdateComponent implements OnInit {
  isSaving = false;
  tribute: ITribute | null = null;

  usersSharedCollection: IUser[] = [];

  editForm: TributeFormGroup = this.tributeFormService.createTributeFormGroup();

  constructor(
    protected tributeService: TributeService,
    protected tributeFormService: TributeFormService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute
  ) {}

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tribute }) => {
      this.tribute = tribute;
      if (tribute) {
        this.updateForm(tribute);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const tribute = this.tributeFormService.getTribute(this.editForm);
    if (tribute.id !== null) {
      this.subscribeToSaveResponse(this.tributeService.update(tribute));
    } else {
      this.subscribeToSaveResponse(this.tributeService.create(tribute));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITribute>>): void {
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

  protected updateForm(tribute: ITribute): void {
    this.tribute = tribute;
    this.tributeFormService.resetForm(this.editForm, tribute);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, tribute.user);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.tribute?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
