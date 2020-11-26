import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-shutdown',
  templateUrl: './shutdown.component.html',
  styleUrls: ['./shutdown.component.css']
})
export class ShutdownComponent implements OnInit {

  constructor(private socket:WebsocketService) { }

  ngOnInit(): void {
    (async () => {
      await this.delay(1500);
      this.socket.sendData('#halt');
    })();
    
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
