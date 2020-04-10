import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NgChartjsModule} from 'ng-chartjs';
import {MatButtonModule} from '@angular/material/button';
import {WebsocketService} from './websocket.service';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import {NgxGaugeModule} from 'ngx-gauge';
const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgChartjsModule,
    MatButtonModule,
    SocketIoModule.forRoot(config),
    NgxGaugeModule,
  ],
  providers: [WebsocketService],
  bootstrap: [AppComponent]
})
export class AppModule { }
