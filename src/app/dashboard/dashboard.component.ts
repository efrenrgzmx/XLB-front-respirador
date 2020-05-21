import {Component, ViewChild, OnInit} from '@angular/core';
import {Color, NgChartjsDirective} from 'ng-chartjs';
import 'chartjs-plugin-streaming';
import { Observable, Subscription } from 'rxjs';
import {WebsocketService} from '../websocket.service';
import {faBackspace, faExclamationTriangle, faGripLinesVertical, faTimes} from '@fortawesome/free-solid-svg-icons';
import {faBell, faBellSlash} from '@fortawesome/free-regular-svg-icons';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  /**
   * Keyboard Behaviour
   */
  keyboardValue = '';
  isKeyboardOpen = false;
  keyboardDescription = '';
  keyboardMinValue = 0;
  keyboardMaxValue = 10;
  keyboardUnit = '';
  keyboardError = '';
  isChangeConfirmationOpen = false;

  /**
   * Alarm Behaviour
   */
  isAlarmActive = false;

  cancelIcon = faTimes;
  pauseIcon = faGripLinesVertical;
  alarmIcon = faExclamationTriangle;
  bellIcon = faBell;
  bellSlashedIcon = faBellSlash;
  backspaceIcon = faBackspace;

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

  pressureData: Chart.ChartDataSets[];
  volumeData: Chart.ChartDataSets[];
  flowData: Chart.ChartDataSets[];
  pressureLbls: Array<any>;
  volumeLbls: Array<any>;
  flowLbls: Array<any>;
  chartOptionsPressure: any;
  chartOptionsVolume: any;
  chartOptionsFlow: any;
  lineChartLegend = true;
  lineChartType = 'line';
  pointsThreshold = 10;
  updateLimiterCounter = 0;
  @ViewChild('ngChartjsPresion') private readonly ngChartjsPressure: NgChartjsDirective;
  @ViewChild('ngChartjsVolume') private readonly ngChartjsVolume: NgChartjsDirective;
  @ViewChild('ngChartjsFlow') private readonly ngChartjsFlow: NgChartjsDirective;


  /**
   * Behaviour
   * **/
  startFlag = false;
  paramsValues = [2.5, 10, 400, 30];
  paramsNames = ['TI', 'FREC', 'VT', 'PIP'];
  paramsUnits = ['', '', ''];
  changedValue = 0;
  paramName = '';
  paramUnit = '';
  toggleCount = 0;

  constructor( private socket: WebsocketService) {
    this.chartInitA();
  }

  ngOnInit() {
    this.chartDataSub = this.socket.currentChartData.subscribe(chartData => this.addData(chartData));
    this.settingsDataSub = this.socket.currentSettingsData.subscribe(settingsData => this.onChangeSettings(settingsData));

    this.paramName = this.paramsNames[this.toggleCount];
    this.changedValue = this.paramsValues[this.toggleCount];
    this.paramUnit = this.paramsUnits[this.toggleCount];

  }

  addData(sampleData) {

    if(!this.ngChartjsPressure)
      return;

    sampleData = JSON.parse(sampleData);
    this.userInfo = sampleData;
    console.log(this.userInfo);

    if (this.updateLimiterCounter > this.pointsThreshold) {

      this.pressureData[0].data.push(this.userInfo.data.chartsData.paw);
      this.volumeData[0].data.push(this.userInfo.data.chartsData.vol);
      this.flowData[0].data.push(this.userInfo.data.chartsData.freq);
      this.pressureLbls.push(Date.now());
      this.volumeLbls.push(Date.now());
      this.flowLbls.push(Date.now());
      this.updateLimiterCounter = 0;
    }
    this.updateLimiterCounter++;
  }

  chartInitA() {
    this.pressureData = [
      {
        label: 'Presion',
        fill: false,
        lineTension: 0,
        backgroundColor: 'rgb(255,169,140)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      },
    ];

    this.volumeData = [
      {
        label: 'Volumen',
        fill: false,
        lineTension: 0,
        backgroundColor: 'rgb(255,169,140)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      },
    ];

    this.flowData = [
      {
        label: 'Flujo',
        fill: false,
        lineTension: 0,
        backgroundColor: 'rgb(255,169,140)',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
        pointBorderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 0,
        data: [],
      },
    ];
    this.pressureLbls  = [];
    this.volumeLbls = [];
    this.flowLbls = [];
    this.chartOptionsPressure = {
      legend: {
        display: false,
        labels: {
          display: false
        }
      },
      tooltips: { enabled: false},
      scales: {
        xAxes: [{
          type: 'realtime',
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
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,1)',
            display: true,
            drawBorder: true,
          },
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
          frameRate: 30              // chart is drawn 5 times every second
        }
      }
    };

    this.chartOptionsVolume = {
      legend: { display: false, labels: { display: false}},
      tooltips: { enabled: false},
      scales: {
        xAxes: [{
          type: 'realtime',
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
            suggestedMax: 1100,
            suggestedMin: 400,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,1)',
            display: true,
            drawBorder: true,
          },
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
          frameRate: 30              // chart is drawn 5 times every second
        }
      }
    };

    this.chartOptionsFlow = {
      legend: { display: false, labels: { display: false}},
      tooltips: { enabled: false},
      scales: {
        xAxes: [{
          type: 'realtime',
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
            suggestedMax: 100,
            suggestedMin: -100,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,1)',
            display: true,
            drawBorder: true,
            zeroLineColor: '#999',
            zeroLineWidth: 2
          },
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
          frameRate: 30              // chart is drawn 5 times every second
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

  onDigitPressed(digit: string) {
    this.keyboardError = '';
    if (digit === '-') {
      this.keyboardValue = this.keyboardValue .slice(0, -1);
    } else if (this.keyboardValue.length > 7) {
      return;
    } else if (digit === '.') {
      if (this.keyboardValue.indexOf('.') === -1) {
        this.keyboardValue += digit;
      }
    } else {
      this.keyboardValue += digit;
    }
  }

  openKeyboard(toggle: number, currentValue: number, desc: string, min: number, max: number, unit: string){
    this.cleanKeyboardData();
    this.toggleCount = toggle;
    this.keyboardValue = `${currentValue}`;
    this.keyboardDescription = desc;
    this.keyboardMinValue = min;
    this.keyboardMaxValue = max;
    this.keyboardUnit = unit;
    this.isKeyboardOpen = true;
  }

  closeKeyboard(isOpeningConfirmation) {
    this.isKeyboardOpen = false;
    if (isOpeningConfirmation) {
      this.isChangeConfirmationOpen = true;
    }
  }

  cleanKeyboardData() {
    this.keyboardValue = '';
    this.keyboardDescription = '';
    this.keyboardMinValue = 0;
    this.keyboardMaxValue = 0;
    this.keyboardUnit = '';
    this.keyboardError = '';
  }

  onChangePressed() {

    const sendValue = Number(this.keyboardValue);
    if (!isNaN(sendValue)) {
      if (sendValue <= this.keyboardMaxValue && sendValue >= this.keyboardMinValue) {

        this.closeKeyboard(true);
      } else {
        this.keyboardError = `Los limites de este parametro son entre ${this.keyboardMinValue} y ${this.keyboardMaxValue}`;
      }
    } else {
      this.keyboardError = 'Número invalido';
    }
  }

  onConfirmChange() {
    this.sendData();
    this.closeConfirm();
  }

  closeConfirm(){
    this.isChangeConfirmationOpen = false;
  }

  sendData() {
    this.socket.sendData(`%${this.toggleCount === 0 ? this.keyboardValue : this.paramsValues[0]},${this.toggleCount === 1 ? this.keyboardValue : this.paramsValues[1]},${this.toggleCount === 2 ? this.keyboardValue : this.paramsValues[2]},${this.toggleCount === 3 ? this.keyboardValue : this.paramsValues[3]}`);
  }

}


export class UserInfo {
  data: {
    chartsData: { paw: number, freq: number, vol: number }
    params: { ppeak: number, volmin: number, vte: number, ftotal: number, peep: number, pip: number }
  };
}

export class SettingsInfo{
  settings: {
    ie: number,
    freq: number,
    vt: number,
    pip: number,
  };
}
