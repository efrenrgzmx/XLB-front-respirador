import { Component, OnInit } from '@angular/core';
import {ProgressBarMode} from '@angular/material/progress-bar';
import {ThemePalette} from '@angular/material/core';
import {faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {WebsocketService} from '../websocket.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  // declarations

  isDarkUI = false;

  // bar
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'indeterminate';
  value = 0;
  bufferValue = 0;
  stepCount = 0;

  // icons
  closeIcon = faTimes;
  checkIcon = faCheck;

  // tests
  /**
   * results status:
   * 0 : in process
   * 1 : success
   * 2 : error
   */
  results = [];
  titles = [];

  // screen control
  finishTests = false;

  /**
   * Subscriptions
   */
  testDataSub: Subscription;

  keepSending = true;



  constructor(private socket: WebsocketService, private router: Router) {
    this.results.push(...[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    this.titles.push(...['Alarmas', 'Bateria', 'Com. Display', 'Motor', 'S. Press 01', 'S. Press 02', 'S. Flow 01', 'S. Flow 02', 'Temperatura', 'Corriente'])
  }

  ngOnInit(): void {
    this.testDataSub = this.socket.currentTestData.subscribe(test => this.onReceiveTest(test));
    this.checkAndApplyTheme();

    this.socket.sendData('#init');
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  checkAndApplyTheme() {
    if (localStorage.getItem('theme') !== null) {
      this.isDarkUI = localStorage.getItem('theme') === '1';
    }
  }

  onReceiveTest(test) {
    this.results = JSON.parse(test).tests;
    this.keepSending = false;
    let blocked = false; 
    this.results.forEach(element => {
      if (element !== 1){
        blocked = true;
      }
    });
    if (!blocked) {
      (async () => {
        await this.delay(600);
        await this.router.navigate(['/patient']);
      })();
    }else {
      (async () => {
        await this.delay(1000);
        this.socket.sendData('#init');
      })();
    }
  }
}
