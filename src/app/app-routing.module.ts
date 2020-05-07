import { RouterModule, Routes, Router } from '@angular/router';
import {NgModule} from '@angular/core';
import {SplashComponent} from './splash/splash.component';
import {TestComponent} from './test/test.component';
import {ConfigurationComponent} from './configuration/configuration.component';
import {PatientComponent} from './patient/patient.component';

const routes: Routes = [
  { path: '' , component : SplashComponent},
  { path: 'test' , component : TestComponent},
  { path: 'configure' , component : ConfigurationComponent},
  { path: 'patient' , component : PatientComponent}
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
