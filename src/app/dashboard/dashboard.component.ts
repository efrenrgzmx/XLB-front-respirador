import {Component, ViewChild, OnInit} from '@angular/core';
import {Color, NgChartjsDirective} from 'ng-chartjs';
import 'chartjs-plugin-streaming';
import { Observable, Subscription } from 'rxjs';
import {WebsocketService} from '../websocket.service';
import {
  faBackspace,
  faChevronLeft,
  faExclamationTriangle,
  faGripLinesVertical,
  faPause,
  faPlay,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import {faBell, faBellSlash, faEnvelope, faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import {Router} from '@angular/router';
import {PatientComponent} from '../patient/patient.component';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isDarkUI = false;
  /**
   * Time
   */
  public now: Date = new Date();
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
  isFirstChangeDone = false;

  /**
   * Alarm Behaviour
   */
  isAlarmActive = false;

  pauseIcon = faPause;
  alarmIcon = faExclamationTriangle;
  playIcon = faPlay;

  /**
   * Subscription
   */
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
   */
  isVentilating = 0;
  isChangeVentilatinigPauseConfirm = false;
  isChangeVentilatinigPlayConfirm = false;
  paramsValues = [2.5, 10, 400, 30];
  paramsNames = ['TI', 'FREC', 'VT', 'PIP'];
  paramsUnits = ['', '', ''];
  changedValue = 0;
  paramName = '';
  paramUnit = '';
  toggleCount = 0;
  sex = 0;
  profile = 0;
  height = 170;
  weight = 70;
  pmeseta = 15;
  mode = 0;

  /**
   * HELP
   */
  backIcon = faChevronLeft;
  mailIcon = faEnvelope;
  questionIcon = faQuestionCircle;
  isHelpOpenned = false;


  constructor( private socket: WebsocketService, private router: Router) {
    if (localStorage.getItem('programData') !== null) {
      const programData: ScreenData = JSON.parse(localStorage.getItem('programData'));

      this.sex = programData.sex;
      this.profile = programData.profile;
      this.weight = programData.weight;
      this.mode = programData.mode;

      console.log(programData);
      this.paramsValues = [programData.ti, programData.freq, programData.volume, programData.pip];
      this.toggleCount = -1;
      this.sendData();
      this.toggleCount = 0;



    }
    this.chartInitA();
  }

  ngOnInit() {
    this.chartDataSub = this.socket.currentChartData.subscribe(chartData => this.addData(chartData));
    this.settingsDataSub = this.socket.currentSettingsData.subscribe(settingsData => this.onChangeSettings(settingsData));

    this.paramName = this.paramsNames[this.toggleCount];
    this.changedValue = this.paramsValues[this.toggleCount];
    this.paramUnit = this.paramsUnits[this.toggleCount];

    this.checkAndApplyTheme();
  }

  addData(sampleData) {

    if (!this.ngChartjsPressure) {
      return;
    }

    sampleData = JSON.parse(sampleData);
    this.userInfo = sampleData;

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
        borderColor: '#F6BE62',
        label: 'Presion',
        fill: false,
        lineTension: 0.2,
        borderCapStyle: 'round',
        borderJoinStyle: 'round',
        borderWidth: 2,
        pointRadius: 0,
        pointHitRadius: 5,
        data: [],
      },
    ];

    this.volumeData = [
      {
        label: 'Volumen',
        fill: false,
        lineTension: 0,
        borderColor: '#33C4F9',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
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
        borderColor: '#00D6DC',
        borderCapStyle: 'round',
        borderDashOffset: 1.0,
        borderJoinStyle: 'round',
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
            duration: 14000,
            refresh: 500,
            delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line
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
            suggestedMax: 60,
            suggestedMin: 0,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,1)',
            display: false,
            drawBorder: true,
            drawTicks: false,
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
          frameRate: 25              // chart is drawn 5 times every second
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
            duration: 14000,
            refresh: 500,      // onRefresh callback will be called every 1000 ms
            delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line
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
            suggestedMax: 1200,
            suggestedMin: 0,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,1)',
            display: false,
            drawBorder: true,
            drawTicks: false,
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
          frameRate: 25              // chart is drawn 5 times every second
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
            duration: 14000,
            refresh: 500,
            delay: 1000,        // delay of 1000 ms, so upcoming values are known before plotting a line
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
            suggestedMax: 120,
            suggestedMin: -120,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,0)',
            display: true,
            drawBorder: true,
            drawTicks: false,
            zeroLineColor: '#00D6DC',
            zeroLineWidth: 1
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
          frameRate: 25              // chart is drawn 5 times every second
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

    this.isVentilating = this.settingsInfo.settings.ventilating;

    this.changedValue = this.paramsValues[this.toggleCount];
  }

  onPlayPressed() {
    this.isChangeVentilatinigPlayConfirm = true;
  }

  onPausePressed() {
    this.isChangeVentilatinigPauseConfirm = true;
  }

  onVentilatingEvent(status) {
    this.closeConfirm();
    // tslint:disable-next-line:max-line-length
    this.socket.sendData(`%${this.paramsValues[0]},${this.paramsValues[1]},${this.paramsValues[2]},${this.paramsValues[3]},${status}`);
  }

  onDigitPressed(digit: string) {
    if (this.isFirstChangeDone === false && digit !== '-') {
      this.isFirstChangeDone = true;
      this.keyboardValue = '';
    }

    this.keyboardError = '';
    if (digit === '-') {
      this.isFirstChangeDone = true;
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
    this.isFirstChangeDone = false;
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

  closeConfirm() {
    this.isChangeVentilatinigPauseConfirm = false;
    this.isChangeVentilatinigPlayConfirm = false;
    this.isChangeConfirmationOpen = false;
  }

  sendData() {
    // tslint:disable-next-line:max-line-length
    this.socket.sendData(`%${this.toggleCount === 0 ? this.keyboardValue : this.paramsValues[0]},${this.toggleCount === 1 ? this.keyboardValue : this.paramsValues[1]},${this.toggleCount === 2 ? this.keyboardValue : this.paramsValues[2]},${this.toggleCount === 3 ? this.keyboardValue : this.paramsValues[3]},${this.isVentilating}`);
  }

  onSettingsPressed() {
    const screenInfo = new ScreenData();

    if (this.userInfo !== undefined) {
      screenInfo.freq = this.settingsInfo.settings.freq;
      screenInfo.ti = this.settingsInfo.settings.ie;
      screenInfo.volume = this.settingsInfo.settings.vt;
      screenInfo.pip = this.settingsInfo.settings.pip;
    } else {
      screenInfo.freq = this.paramsValues[1];
      screenInfo.ti = this.paramsValues[0];
      screenInfo.volume = this.paramsValues[2];
      screenInfo.pip = this.paramsValues[3];
    }

    screenInfo.sex = this.sex;
    screenInfo.pmeseta = this.pmeseta;
    screenInfo.weight = this.weight;
    screenInfo.height = this.height;
    screenInfo.mode = this.mode;
    screenInfo.profile = this.profile;

    localStorage.setItem('status', status);
    localStorage.setItem('settingsStep', JSON.stringify(3));
    localStorage.setItem('programData', JSON.stringify(screenInfo));

    this.router.navigate(['/patient']);
  }

  checkAndApplyTheme() {
    if (localStorage.getItem('theme') !== null) {
      this.isDarkUI = localStorage.getItem('theme') === '1';
    }
  }

  getSexDescription(): string {
    switch (this.sex) {
      case 0:
        return 'Hombre';

      case 1:
        return 'Mujer';
    }
  }

  getProfileDescription(): string {
    switch (this.profile) {
      case 0:
        return 'Adulto';

      case 1:
        return 'Infante';

      default:
        return '-';
    }
  }

  getModeDescription(): string {
    switch (this.mode) {
      case 0:
        return 'C';

      case 1:
        return 'A';

      case 2:
        return 'AC';
    }
  }

  onHelpBack(){
    this.isHelpOpenned = false;
  }

}


export class UserInfo {
  data: {
    chartsData: { paw: number, freq: number, vol: number }
    params: { ppeak: number, volmin: number, vte: number, ftotal: number, peep: number, pip: number, fpeak: number}
  };
}

export class SettingsInfo {
  settings: {
    ie: number,
    freq: number,
    vt: number,
    pip: number,
    ventilating: number,
  };
}

export class ScreenData {
  freq: number;
  ti: number;
  volume: number;
  pip: number;
  pmeseta: number;
  sex: number;
  height: number;
  weight: number;
  profile: number;
  mode: number;
}
