import {Component, ViewChild, OnInit} from '@angular/core';
import {Color, NgChartjsDirective} from 'ng-chartjs';
import {WebsocketService} from './websocket.service';
import 'chartjs-plugin-streaming';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'XLB-resp';

  start = false;

  PIP = 0;
  PEEP = 0;
  FR = 0;
  VL = 0;

  gaugeInfo : ChartInfo;

  lineChartDataA: Chart.ChartDataSets[];
  lineChartLabelsA: Array<any>;
  lineChartOptionsA: any;

  lineChartDataB: Chart.ChartDataSets[];
  lineChartLabelsB: Array<any>;
  lineChartOptionsB: any;

  lineChartDataC: Chart.ChartDataSets[];
  lineChartLabelsC: Array<any>;
  lineChartOptionsC: any;

  lineChartLegend = true;
  lineChartType = 'line';

  gaugeType = 'arch';

  @ViewChild('ngChartjsA') private readonly ngChartjsA: NgChartjsDirective;
  @ViewChild('ngChartjsB') private readonly ngChartjsB: NgChartjsDirective;
  @ViewChild('ngChartjsC') private readonly ngChartjsC: NgChartjsDirective;

  chartDataSub: Subscription;
  settingsDataSub: Subscription;


  constructor( private socket: WebsocketService) {
    this.gaugeInfo = {chartsData: { PT: 0, VT: 0, FT: 0}};

    this.chartInitA();
    this.chartInitB();
    this.chartInitC();
  }

  ngOnInit() {
    this.chartDataSub = this.socket.currentChartData.subscribe(chartData => this.addData(chartData));
    this.settingsDataSub = this.socket.currentSettingsData.subscribe(settingsData => this.onChangeSettings(settingsData));

  }

  addData(sampleData) {

    sampleData = JSON.parse(sampleData);
    this.gaugeInfo = sampleData;

    this.lineChartDataA[0].data.push(sampleData.chartsData.PT);
    this.lineChartLabelsA.push(Date.now());

    this.lineChartDataB[0].data.push(sampleData.chartsData.VT);
    this.lineChartLabelsB.push(Date.now());

    this.lineChartDataC[0].data.push(sampleData.chartsData.FT);
    this.lineChartLabelsC.push(Date.now());
  }

  chartInitA() {
    this.lineChartDataA = [
      {
        label: 'PRESION/ TIEMPO',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointRadius: 0,
        pointHitRadius: 10,
        data: [],
      },
    ];
    this.lineChartLabelsA  = [];
    this.lineChartOptionsA = {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'realtime',
          realtime: {
            refresh: 20,
            delay: 700,
            frameRate: 120
          },
          ticks: {
            fontColor: 'rgba(255,255,255,1)',
            maxTicksLimit: 10,
          }
        }],
        yAxes: [{
          ticks: {
          suggestedMax: 40,
          suggestedMin: 0,
          }
        }]
      }
    };
  }

  chartInitB() {
    this.lineChartDataB = [
      {
        label: 'VOLUMEN/ TIEMPO',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointRadius: 0,
        pointHitRadius: 10,
        data: [],
      },
    ];
    this.lineChartLabelsB  = [];
    this.lineChartOptionsB = {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'realtime',
          realtime: {
            refresh: 20,
            delay: 700,
            frameRate: 120
          },
          ticks: {
            fontColor: 'rgba(255,255,255,1)',
            maxTicksLimit: 10,
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMax: 1500,
            suggestedMin: 0,
            }
        }]
      }

    };
  }

  chartInitC() {
    this.lineChartDataC = [
      {
        label: 'FLUJO/ TIEMPO',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointRadius: 0,
        pointHitRadius: 10,
        data: [],
      },
    ];
    this.lineChartLabelsC  = [];
    this.lineChartOptionsC = {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'realtime',
          realtime: {
            refresh: 20,
            delay: 700,
            frameRate: 120
          },
          ticks: {
            fontColor: 'rgba(255,255,255,1)',
            maxTicksLimit: 10,
          }
        }],
        yAxes: [{
          ticks: {
            suggestedMax: 100,
            suggestedMin: -100,
          }
        }]
      }
    };
  }

  onPlusPEEP() {
    this.socket.sendData(`PEEP+`);
  }

  onSubPEEP() {
    this.socket.sendData(`PEEP-`);
  }

  onPlusPIP() {
    this.socket.sendData(`PIP+`);
  }

  onSubPIP() {
    this.socket.sendData(`PIP-`);
  }

  onPlusFR() {
    this.socket.sendData(`FRQ+`);
  }

  onSubFR() {
    this.socket.sendData(`FRQ-`);
  }

  onPlusVolumen() {
    this.socket.sendData(`VOL+`);

  }

  onSubVolumen() {
    this.socket.sendData(`VOL-`);
  }

  onChangeSettings(settingsInfo) {

    console.log(settingsInfo);

    settingsInfo = JSON.parse(settingsInfo);

    this.PIP = settingsInfo.settings.PIP;
    this.VL = settingsInfo.settings.VL;
    this.FR = settingsInfo.settings.FR;
  }

  onInitPressed() {
    this.start = true;
  }

  onStopPressed() {
    this.start = false;
  }
}

export class ChartInfo {
  chartsData: {
    PT: number;
    VT: number;
    FT: number;
  };
}

export class SettingsInfo {
  settings: {
    PIP: number;
    VL: number;
    FR: number;
  };
}

