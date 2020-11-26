import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {


  currentChartData = this.socket.fromEvent<string>('chartsData');
  currentSettingsData = this.socket.fromEvent<string>('settings');
  currentAlertData = this.socket.fromEvent<string>('alerts');
  currentTestData = this.socket.fromEvent<string>('test');
  currentDiagnosticData = this.socket.fromEvent<string>('diagnostic');

  constructor(private socket: Socket) { }

  sendData(info: string) {
    this.socket.emit('sendData', info);
  }

}

