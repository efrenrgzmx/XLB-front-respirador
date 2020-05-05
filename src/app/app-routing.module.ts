import { RouterModule, Routes, Router } from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  //{ path: '/home' , component : yourComponenetName}
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
