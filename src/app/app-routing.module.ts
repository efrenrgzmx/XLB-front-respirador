import { RouterModule, Routes, Router } from '@angular/router';
import {NgModule} from '@angular/core';
import {SplashComponent} from './splash/splash.component';
import {TestComponent} from './test/test.component';

const routes: Routes = [
  { path: '' , component : SplashComponent},
  { path: 'test' , component : TestComponent}
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
