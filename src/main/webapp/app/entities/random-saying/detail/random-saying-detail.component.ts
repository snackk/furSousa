import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IRandomSaying } from '../random-saying.model';

@Component({
  selector: 'jhi-random-saying-detail',
  templateUrl: './random-saying-detail.component.html',
})
export class RandomSayingDetailComponent implements OnInit {
  randomSaying: IRandomSaying | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ randomSaying }) => {
      this.randomSaying = randomSaying;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
