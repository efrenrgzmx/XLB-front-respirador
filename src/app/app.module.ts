import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgChartjsModule} from 'ng-chartjs';
import {MatButtonModule} from '@angular/material/button';
import {WebsocketService} from './websocket.service';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { AppRoutingModule } from './app-routing.module';
import { SplashComponent } from './splash/splash.component';
import { TestComponent } from './test/test.component';
import { ErrorComponent } from './common/error/error.component';
import { PatientComponent } from './patient/patient.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EditboxComponent } from './common/editbox/editbox.component';
import { ConfigurationComponent } from './configuration/configuration.component';
import {MatProgressBar, MatProgressBarModule} from '@angular/material/progress-bar';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };


@NgModule({
  declarations: [
    AppComponent,
    SplashComponent,
    TestComponent,
    ErrorComponent,
    PatientComponent,
    DashboardComponent,
    EditboxComponent,
    ConfigurationComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgChartjsModule,
    MatButtonModule,
    SocketIoModule.forRoot(config),
    AppRoutingModule,
    MatProgressBarModule,
    FontAwesomeModule,
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
