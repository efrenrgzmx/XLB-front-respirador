import {Component, ViewChild, OnInit} from '@angular/core';
import {Color, NgChartjsDirective} from 'ng-chartjs';
import {WebsocketService} from './websocket.service';

import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'XLB-resp';

  PIP = 0;
  PEEP = 0;
  FR = 0;
  VL = 0;

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
  gaugeValue = 28.3;
  gaugeLabel = 'PIP';
  gaugeAppendText = '';

  @ViewChild('ngChartjsA') private readonly ngChartjsA: NgChartjsDirective;
  @ViewChild('ngChartjsB') private readonly ngChartjsB: NgChartjsDirective;
  @ViewChild('ngChartjsC') private readonly ngChartjsC: NgChartjsDirective;

  dataSub: Subscription;

  constructor( private socket: WebsocketService) {
    this.chartInitA();
    this.chartInitB();
    this.chartInitC();
  }

  ngOnInit() {
    this.dataSub = this.socket.currentData.subscribe(chartData => this.addData(chartData));

  }

  addData(sampleData) {

    sampleData = JSON.parse(sampleData);
    console.log(sampleData.chartsData);

    if (this.lineChartDataA[0].data.length > 32) {
      this.lineChartDataA[0].data.shift();
      this.lineChartLabelsA.shift();

      this.lineChartDataB[0].data.shift();
      this.lineChartLabelsB.shift();

      this.lineChartDataC[0].data.shift();
      this.lineChartLabelsC.shift();
    }
    this.lineChartDataA[0].data.push(sampleData.chartsData.PT);
    this.lineChartLabelsA.push(' ');

    this.lineChartDataB[0].data.push(sampleData.chartsData.VT);
    this.lineChartLabelsB.push(' ');

    this.lineChartDataC[0].data.push(sampleData.chartsData.FT);
    this.lineChartLabelsC.push(' ');

    this.ngChartjsA.update();
    this.ngChartjsB.update();
    this.ngChartjsC.update();
  }

  chartInitA() {
    this.lineChartDataA = [
      {
        label: 'PRESION/ TIEMPO',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointRadius: 1,
        pointHitRadius: 10,
        data: [0],
      },
    ];
    this.lineChartLabelsA  = ['0'];
    this.lineChartOptionsA = {
      responsive: true
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
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointRadius: 1,
        pointHitRadius: 10,
        data: [0],
      },
    ];
    this.lineChartLabelsB  = ['0'];
    this.lineChartOptionsB = {
      responsive: true
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
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointRadius: 1,
        pointHitRadius: 10,
        data: [0],
      },
    ];
    this.lineChartLabelsC  = ['0'];
    this.lineChartOptionsC = {
      responsive: true
    };
  }

  onPlusPEEP() {
    this.PEEP ++;
    this.socket.sendData(`{"PEEP":${this.PEEP}}`);
  }

  onSubPEEP() {
    this.PEEP --;
    this.socket.sendData(`{"PEEP":${this.PEEP}}`);
  }

  onPlusPIP() {
    this.PIP ++;
    this.socket.sendData(`{"PIP":${this.PIP}}`);
  }

  onSubPIP() {
    this.PIP --;
    this.socket.sendData(`{"PIP":${this.PIP}}`);
  }

  onPlusFR() {
    this.FR ++;
    this.socket.sendData(`{"FR":${this.FR}}`);
  }

  onSubFR() {
    this.FR --;
    this.socket.sendData(`{"FR":${this.FR}}`);
  }

  onPlusVolumen() {
    this.VL++;
    this.socket.sendData(`{"VL":${this.VL}}`);

  }

  onSubVolumen() {
    this.VL--;
    this.socket.sendData(`{"VL":${this.VL}}`);
  }
}

export class ChartInfo {
  chartsData: {
    PT: number;
    VT: number;
    FT: number;
  };
}
