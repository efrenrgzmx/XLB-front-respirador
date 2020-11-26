import {Component, OnInit, ViewChild} from '@angular/core';
import {NgChartjsDirective} from 'ng-chartjs';
import 'chartjs-plugin-streaming';
import {Subscription} from 'rxjs';
import {WebsocketService} from '../websocket.service';
import {faChevronLeft, faExclamationTriangle, faPause, faPlay, faQuestion} from '@fortawesome/free-solid-svg-icons';
import {faEnvelope, faQuestionCircle} from '@fortawesome/free-regular-svg-icons';
import {Router} from '@angular/router';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isDarkUI = false;

  /**
   * System
   */
  isSystemOpen = false;
  systemTabToggle = 0;
  cycles = 0;
  cyclesVentilating = 3334;
  activeTime = 0;
  gaugeType = 'arch';
  gaugeLabel = '';
  gaugeAppendText = '°';
  blueColor = 'rgba(82,111,220,1)';
  redColor  = 'rgba(246,104,98,1)';

  tempMotorColor = '';
  tempDriverColor = '';
  currentMotorColor = '';
  currentPeakColor = '';

  tempMotor = 30;
  tempDriver = 100;
  currentMotor = 3;
  currentPeak = 1.5;
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
  isKbValueDecimal = false;

  /**
   * Alarm Behaviour
   */
  isAlarmActive = false;
  isAlarmOpen =  false;
  pauseIcon = faPause;
  alarmIcon = faExclamationTriangle;
  playIcon = faPlay;
  questionSoloIcon = faQuestion;
  alarmTabSelected = 0;
  currentAlarms = [];
  alarmHistory = [];
  currentAlarm: Alarm;
  pipAlarmId = -1;
  maxPIP = 30;

  /**
   * Subscription
   */
  userInfo: UserInfo;
  settingsInfo: SettingsInfo;
  chartDataSub: Subscription;
  settingsDataSub: Subscription;
  alertsDataSub: Subscription;
  diagnosticDataSub: Subscription;


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
  paramsValues = [2.5, 10, 400, 30, 5];
  paramsNames = ['TI', 'FREC', 'VT', 'PIP', 'PEEP'];
  paramsUnits = ['', '', ''];
  changedValue = 0;
  paramName = '';
  paramUnit = '';
  toggleCount = 0;
  sex = 0;
  profile = 0;
  height = 1.70;
  weight = 70;
  pmeseta = 15;
  mode = 0;
  predictedVol = 0;

  /**
   * HELP
   */
  backIcon = faChevronLeft;
  mailIcon = faEnvelope;
  questionIcon = faQuestionCircle;
  isHelpOpen = false;


  constructor( private socket: WebsocketService, private router: Router) {
    if (localStorage.getItem('status') !== null && localStorage.getItem('status') === '1') {
        this.isVentilating = 1;
    }
    if (localStorage.getItem('programData') !== null) {
      const programData: ScreenData = JSON.parse(localStorage.getItem('programData'));

      this.sex = programData.sex;
      this.profile = programData.profile;
      this.weight = programData.weight;
      this.mode = programData.mode;

      console.log("programdata: " + programData);
      this.paramsValues = [programData.ti, programData.freq, programData.volume, programData.pip, programData.peep];
      this.toggleCount = -1;
      this.sendData();
      this.toggleCount = 0;
    }

    this.userInfo = null;
    this.chartInitA();

    this.predictedVol = 8 * this.weight;
  }

  ngOnInit() {

    this.tempMotorColor = this.blueColor;
    this.tempDriverColor = this.blueColor;
    this.currentMotorColor = this.blueColor;
    this.currentPeakColor = this.blueColor;

    this.chartDataSub = this.socket.currentChartData.subscribe(chartData => this.addData(chartData));
    this.settingsDataSub = this.socket.currentSettingsData.subscribe(settingsData => this.onChangeSettings(settingsData));
    this.alertsDataSub = this.socket.currentAlertData.subscribe(alert => this.onReceiveAlert(alert));
    this.diagnosticDataSub = this.socket.currentDiagnosticData.subscribe(ddata => this.onReceiveDiagnostic(ddata));


    this.paramName = this.paramsNames[this.toggleCount];
    this.changedValue = this.paramsValues[this.toggleCount];
    this.paramUnit = this.paramsUnits[this.toggleCount];

    this.checkAndApplyTheme();

    console.log(this.profile);
  }

  addData(sampleData) {

    if (!this.ngChartjsPressure) {
      return;
    }

    sampleData = JSON.parse(sampleData);
    this.userInfo = sampleData;
    this.verifyParamsOnRefresh();

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
        lineTension: 0.2,
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
        lineTension: 0.2,
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
            suggestedMax: 700,
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
            suggestedMax: 50,
            suggestedMin: -50,
            display: false
          },
          gridLines: {
            color: 'rgba(240,240,240,0)',
            display: true,
            drawBorder: true,
            drawTicks: false,
            zeroLineColor: '#C9D2F3',
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
      this.settingsInfo.settings.pip,
      this.settingsInfo.settings.peep];

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
    this.socket.sendData(`%${this.paramsValues[0]},${this.paramsValues[1]},${this.paramsValues[2]},${this.paramsValues[3]},${this.paramsValues[4]},${status}`);
  }

  onDigitPressed(digit: string) {
    if (!this.isKbValueDecimal && digit === '.') {
      this.keyboardError = 'Este parametro no acepta decimales';
      return;
    }

    if (this.isFirstChangeDone === false && digit !== '-') {
      this.isFirstChangeDone = true;
      this.keyboardValue = '';
    }

    const currentValue = this.keyboardValue + digit;
    let addDecimal = false;
    if (this.isKbValueDecimal === true) {
      if(Number(currentValue) > Number(this.keyboardMaxValue)) {
        this.keyboardError = 'El numero limite para este parametro es ' + this.keyboardMaxValue;
        return;
      } else {
        addDecimal = true;
      }
    } else {
      if(Number(currentValue) > Number(this.keyboardMaxValue)) {
        this.keyboardError = 'El numero limite para este parametro es ' + this.keyboardMaxValue;
        return;
      }
    }


    this.keyboardError = '';
    if (digit === '-') {
      this.isFirstChangeDone = true;
      this.keyboardValue = this.keyboardValue .slice(0, -1);
    } else if (digit === '.') {
      if (this.keyboardValue.indexOf('.') === -1) {
        this.keyboardValue += digit;
      }
    } else {
      if(this.isKbValueDecimal && this.keyboardValue.length>=3){
        this.keyboardError = 'Máximo de decimales encontrado';
        return;
      }
      this.keyboardValue += digit;
      if (this.keyboardValue.indexOf('.') === -1 && addDecimal) {
        this.keyboardValue += '.' ;
      }
    }
  }

  openKeyboard(toggle: number, currentValue: number, desc: string, min: number, max: number, unit: string, isDecimal:boolean){
    this.cleanKeyboardData();
    this.toggleCount = toggle;
    this.keyboardValue = `${currentValue}`;
    this.keyboardDescription = desc;
    this.keyboardMinValue = min;
    this.keyboardMaxValue = max;
    this.keyboardUnit = unit;
    this.isKeyboardOpen = true;
    this.isFirstChangeDone = false;
    this.isKbValueDecimal = isDecimal;
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
    let queuedVentFlag = null;
    if (localStorage.getItem('status') !== null && this.isVentilating !== 1) {
        localStorage.removeItem('status');
        queuedVentFlag = 1;
    }
    console.log('con: ' + queuedVentFlag);
    // tslint:disable-next-line:max-line-length
    this.socket.sendData(`%${this.toggleCount === 0 ? this.keyboardValue : this.paramsValues[0]},${this.toggleCount === 1 ? this.keyboardValue : this.paramsValues[1]},${this.toggleCount === 2 ? this.keyboardValue : this.paramsValues[2]},${this.toggleCount === 3 ? this.keyboardValue : this.paramsValues[3]},${this.toggleCount === 4 ? this.keyboardValue : this.paramsValues[4]},${queuedVentFlag === null ? this.isVentilating : queuedVentFlag}`);
    queuedVentFlag = null;
  }

  onSettingsPressed() {
    const screenInfo = new ScreenData();
    if (this.settingsInfo !== undefined) {
      screenInfo.freq = this.settingsInfo.settings.freq;
      screenInfo.ti = this.settingsInfo.settings.ie;
      screenInfo.volume = this.settingsInfo.settings.vt;
      screenInfo.pip = this.settingsInfo.settings.pip;
      screenInfo.peep = this.settingsInfo.settings.peep;
    } else {
      screenInfo.freq = this.paramsValues[1];
      screenInfo.ti = this.paramsValues[0];
      screenInfo.volume = this.paramsValues[2];
      screenInfo.pip = this.paramsValues[3];
      screenInfo.peep = this.paramsValues[4];
    }

    screenInfo.sex = this.sex;
    screenInfo.pmeseta = this.pmeseta;
    screenInfo.weight = this.weight;
    screenInfo.height = this.height;
    screenInfo.mode = this.mode;
    screenInfo.profile = this.profile;

    localStorage.setItem('status', `${this.isVentilating}`);
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

  onHelpBack() {
    this.isHelpOpen = false;
  }

  getIEDescription() {
    const freq = this.paramsValues[1];
    const rpm = 60 / freq;
    const te = rpm - this.paramsValues[0];

    return te / this.paramsValues[0];
  }

  onAlarmBack() {
    this.isAlarmOpen = false;
  }

  onTabPressed(index) {
    this.alarmTabSelected = index;
  }

  onReceiveAlert(alert) {
    console.log(alert);
    this.currentAlarms = JSON.parse(alert)["alerts"];
    if(this.currentAlarms.length > 0){
      this.currentAlarm = this.currentAlarms[0];
      this.alarmHistory = this.alarmHistory.concat(this.currentAlarms);
      this.isAlarmActive = true;
    }else{
      this.isAlarmActive = false;
    }
  }

  onReceiveDiagnostic( ddata){
    console.log(ddata);
    let userData : DiagnosticData = JSON.parse(ddata);

    this.tempDriver = userData.data.tempdriver;
    this.tempMotor = userData.data.tempmotor;
    this.currentMotor = userData.data.corrientemotor;
    this.cyclesVentilating = userData.data.ciclos;
    this.currentPeak = userData.data.picomotor;

    if(this.tempMotor >= 49){
      this.tempMotorColor = this.redColor
    } else{
      this.tempMotorColor = this.blueColor;
    }

    if(this.tempDriver >= 60){ 
      this.tempDriverColor = this.redColor
    } else{
      this.tempDriverColor = this.blueColor;
    }

    if(this.currentMotor >= 3){
      this.currentMotorColor = this.redColor
    } else{
      this.currentMotorColor = this.blueColor;
    }

    if(this.currentPeak >= 3){
      this.currentPeakColor = this.redColor
    } else{
      this.currentPeakColor = this.blueColor;
    }
  }

  verifyParamsOnRefresh() {
    this.maxPIP = this.paramsValues[3];
    if (this.userInfo != null &&  this.userInfo.data.params.ppeak >= this.maxPIP) {
      if (this.isAlarmActive && this.currentAlarm.affectedSector === 0) { return; }
      console.log('ppeak: ' + this.userInfo.data.params.ppeak + ' - ' + this.paramsValues[4]);
      const pipAlarm = new Alarm(0, 'Presión pico', 'Presión pico alcanzada', this.userInfo.data.params.fpeak, 1, false, Date.now());
      this.currentAlarms.push(pipAlarm);
      this.alarmHistory.push(pipAlarm);
      this.pipAlarmId = this.currentAlarms.length - 1;
      this.currentAlarm = pipAlarm;
      this.isAlarmActive = true;

    } else if (this.userInfo != null &&  this.userInfo.data.params.ppeak < this.paramsValues[3]) {
      
      //this.isAlarmActive = false;
      //this.currentAlarm = null;

      if(this.pipAlarmId !== -1){
        this.currentAlarms.splice(this.pipAlarmId, 1);
        this.pipAlarmId = -1;
      }

      if(this.currentAlarms.length > 0){
        this.currentAlarm = this.currentAlarms[0];
      }
      else{
        this.currentAlarm = null;
        this.isAlarmActive = false;
      }
    }
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
    peep: number,
    ventilating: number,
  };
}

export class ScreenData {
  freq: number;
  ti: number;
  volume: number;
  pip: number;
  peep: number;
  pmeseta: number;
  sex: number;
  height: number;
  weight: number;
  profile: number;
  mode: number;
}

export class  Alarm {
  /*
  0 - Presion
  2 - Temperatura driver
  3 - Temperatura Driver Crítica
  4 - Temperatura Motor
  5 - Temperatura Motor
  6 - Corriente Driver Crítica
  7 - Bateria
   */

  constructor( affectedSector, title, description, value, severity, seen, time) {
    this.affectedSector = affectedSector;
    this.title = title;
    this.description = description;
    this.value = value;
    this.severity = severity;
    this.seen = seen;
    this.timestamp = time;
  }

  affectedSector: number;
  title: string;
  description: string;
  value: number;
  severity: number;
  seen: boolean;
  timestamp: Date;
}

export class DiagnosticData{
  data: {
    tempmotor: number,
    tempdriver: number,
    corrientemotor: number,
    picomotor: number,
    ciclos: number
  }
}
