import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ITribute } from '../tribute.model';

@Component({
  selector: 'jhi-tribute-detail',
  templateUrl: './tribute-detail.component.html',
})
export class TributeDetailComponent implements OnInit {
  tribute: ITribute | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ tribute }) => {
      this.tribute = tribute;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
