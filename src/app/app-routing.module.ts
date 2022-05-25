import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DiffComponent } from './diff/diff.component';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/diff',
  //   pathMatch: 'full',
  // },
  {
    component: DiffComponent,
    path: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
