import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'tribute',
        data: { pageTitle: 'Tributes' },
        loadChildren: () => import('./tribute/tribute.module').then(m => m.TributeModule),
      },
      {
        path: 'random-saying',
        data: { pageTitle: 'RandomSayings' },
        loadChildren: () => import('./random-saying/random-saying.module').then(m => m.RandomSayingModule),
      },
      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
