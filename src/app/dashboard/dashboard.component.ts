import {Component, ViewChild, OnInit} from '@angular/core';
import {Color, NgChartjsDirective} from 'ng-chartjs';
import 'chartjs-plugin-streaming';
import { Observable, Subscription } from 'rxjs';
import {WebsocketService} from '../websocket.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  /**
   * Subscription
   * * **/
  userInfo: UserInfo;
  settingsInfo: SettingsInfo;
  chartDataSub: Subscription;
  settingsDataSub: Subscription;


  /**
   * Chart
   */
  provitionalData: Array<any>;
  lineChartDataA: Chart.ChartDataSets[];
  lineChartLabelsA: Array<any>;
  lineChartOptionsA: any;
  lineChartLegend = true;
  lineChartType = 'line';
  pointsThreshold = 10;
  updateLimiterCounter = 0;
  @ViewChild('ngChartjsA') private readonly ngChartjsA: NgChartjsDirective;

  /**
   * Behaviour
   * **/
  startFlag = false;
  paramsValues = [2, 10, 400, 30];
  paramsNames = ['I:E', 'FREC', 'VT', 'PIP'];
  paramsUnits = ['', '', ''];
  changedValue = 0;
  paramName = '';
  paramUnit = '';
  toggleCount = 0;

  constructor( private socket: WebsocketService) {
    this.chartInitA();
    this.provitionalData = [];
    this.provitionalData.push([]);
    this.provitionalData.push([]);
    this.provitionalData.push([]);
    this.provitionalData.push([]);
  }

  ngOnInit() {
    this.chartDataSub = this.socket.currentChartData.subscribe(chartData => this.addData(chartData));
    this.settingsDataSub = this.socket.currentSettingsData.subscribe(settingsData => this.onChangeSettings(settingsData));

    this.paramName = this.paramsNames[this.toggleCount];
    this.changedValue = this.paramsValues[this.toggleCount];
    this.paramUnit = this.paramsUnits[this.toggleCount];

  }

  addData(sampleData) {

    if(!this.ngChartjsA)
      return;

    sampleData = JSON.parse(sampleData);
    this.userInfo = sampleData;

    /*this.provitionalData[0].push(this.userInfo.data.chartsData.paw);
    this.provitionalData[1].push(this.userInfo.data.chartsData.vol);
    this.provitionalData[2].push(this.userInfo.data.chartsData.freq);
    this.provitionalData[3].push(Date.now());*/
    console.log(this.updateLimiterCounter);
    if (this.updateLimiterCounter > this.pointsThreshold) {
      /*console.log(this.lineChartDataA[0])
      this.lineChartDataA[0].data.push(...this.provitionalData[0]);
      this.lineChartDataA[1].data.push(...this.provitionalData[1]);
      this.lineChartDataA[2].data.push(...this.provitionalData[2]);
      this.lineChartLabelsA.push(this.provitionalData[3]);

      this.provitionalData[0] = [];
      this.provitionalData[1] = [];
      this.provitionalData[2] = [];
      this.provitionalData[3] = [];*/

      this.lineChartDataA[0].data.push(this.userInfo.data.chartsData.paw);
      this.lineChartDataA[1].data.push(this.userInfo.data.chartsData.vol);
      this.lineChartDataA[2].data.push(this.userInfo.data.chartsData.freq);
      this.lineChartLabelsA.push(Date.now());
      this.updateLimiterCounter = 0;
    }
    this.updateLimiterCounter++;
  }

  chartInitA() {
    this.lineChartDataA = [
      {
        label: 'PRESION',
        fill: false,
        lineTension: 0.3,
        backgroundColor: 'rgb(255,169,140)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      },
      {
        label: 'VOLUMEN',
        fill: false,
        lineTension: 0.3,
        backgroundColor: 'rgba(75,255,192,1)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      },
      {
        label: 'FLUJO',
        fill: false,
        lineTension: 0.3,
        backgroundColor: 'rgba(75,255,192,1)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      }
    ];
    this.lineChartLabelsA  = [];
    this.lineChartOptionsA = {
      tooltips: {
        enabled: false
      },
      scales: {
        xAxes: [{
          type: 'realtime',   // x axis will auto-scroll from right to left
          realtime: {         // per-axis options
            duration: 14000,    // data in the past 20000 ms will be displayed
            refresh: 100,      // onRefresh callback will be called every 1000 ms
            delay: 2500,        // delay of 1000 ms, so upcoming values are known before plotting a line
            pause: false,       // chart is not paused
            ttl: undefined,     // data will be automatically deleted as it disappears off the chart
          },
          ticks: {
            fontColor: 'rgba(255,255,255,1)',
            display: false,
          },
          gridLines: {
            display: false
          },
        }],
        yAxes: [{
          ticks: {
            suggestedMax: 40,
            suggestedMin: 0,
          }
        }]
      },
      animation: {
        duration: 0                    // general animation time
      },
      hover: {
        animationDuration: 0           // duration of animations when hovering an item
      },
      responsiveAnimationDuration: 0,    // animation duration after a resize
      plugins: {
        streaming: {
          frameRate: 50              // chart is drawn 5 times every second
        }
      }
    };
  }

  onChangeSettings(setInfo) {
    setInfo = JSON.parse(setInfo);
    this.settingsInfo = setInfo;

    this.paramsValues = [this.settingsInfo.settings.ie,
      this.settingsInfo.settings.freq,
      this.settingsInfo.settings.vt,
      this.settingsInfo.settings.pip];

    this.changedValue = this.paramsValues[this.toggleCount];
  }

  onInitPressed() {
    this.startFlag = true;
  }

  onStopPressed() {
    this.startFlag = false;
  }

  onToggleParam() {
    this.toggleCount ++;
    if (this.toggleCount >= this.paramsNames.length) {
      this.toggleCount = 0;
    }
    this.changedValue = this.paramsValues[this.toggleCount];
    this.paramName = this.paramsNames[this.toggleCount];
  }

  addValue(){

    if(this.toggleCount === 0) { // I:E
      if (this.changedValue < 3) {
        this.changedValue ++;
      }
    } else if (this.toggleCount === 1) { // FREC
      this.changedValue++;
    } else if (this.toggleCount === 2) { // VT
      this.changedValue += 50;
    } else { // PIP
      if (this.changedValue < 40) {
        this.changedValue++;
      }
    }

  }

  subValue() {

    if (this.toggleCount === 0) {
      if (this.changedValue - 1 > 0) {
        this.changedValue --;
      }
    } else if (this.toggleCount === 1) {
      if (this.changedValue > 1) {
        this.changedValue--;
      }
    } else if (this.toggleCount === 2) {
      if (this.changedValue > 50) {
        this.changedValue -= 50;
      }
    }else {
      if (this.changedValue > 10) {
        this.changedValue --;
      }
    }
  }

  onConfirm() {
    // tslint:disable-next-line:max-line-length
    this.socket.sendData(`%${this.toggleCount === 0 ? this.changedValue : this.paramsValues[0]},${this.toggleCount === 1 ? this.changedValue : this.paramsValues[1]},${this.toggleCount === 2 ? this.changedValue : this.paramsValues[2]},${this.toggleCount === 3 ? this.changedValue : this.paramsValues[3]}`);
  }
}


export class UserInfo {
  data: {
    chartsData: { paw: number, freq: number, vol: number }
    params: { ppeak: number, volmin: number, vte: number, ftotal: number, peep: number, pip: number}
  };
