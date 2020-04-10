import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {


  currentData = this.socket.fromEvent<string>('chartsData');

  constructor(private socket: Socket) { }

  getData(id: string) {
    this.socket.emit('getData', id);
  }


  sendData(info: string) {
    this.socket.emit('sendData', info);
  }

}

