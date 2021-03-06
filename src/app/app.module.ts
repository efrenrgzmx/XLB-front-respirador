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
import {MatTabsModule} from '@angular/material/tabs';
import {MatRippleModule} from '@angular/material/core';
import { KeyboardComponent } from './common/keyboard/keyboard.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { DateAgoPipe } from './pipes/date-ago.pipe';
import { TimeFormatPipe } from './pipes/time-format.pipe';
import {NgxGaugeModule} from 'ngx-gauge';
import { ShutdownComponent } from './shutdown/shutdown.component';
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
    ConfigurationComponent,
    KeyboardComponent,
    DateAgoPipe,
    TimeFormatPipe,
    ShutdownComponent
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
    MatTabsModule,
    MatRippleModule,
    ReactiveFormsModule,
    FormsModule,
    NgxGaugeModule,
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
