import { Component, OnInit } from '@angular/core';
import {faChevronLeft, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  isDarkUI = false;
  status = false;
  /**
   * Keyboard Behaviour
   */
  valueIndex = 0;
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


  routeOrigin = undefined;

  plusIcon = faPlus;
  minusIcon = faMinus;
  backIcon = faChevronLeft;

  step = 0;
  comeFromDashboard = false;

  patientTabSelected = 0;
  profile = -1;
  sexSelected = 0;
  mode = -1;
  height = 1.50;
  weight = 50;
  doesChangeWeight = false;


  // controlled mode
  freq = 14;
  ti = 2;
  vol = 8;
  flow = 21;
  pip = 30;
  peep = 5;
  pmeseta = 15;
  predictedVol = 8;

  configTabSelected = 0;
  beginVent = false;

  isVolumeAlertOpen = false;
  constructor(private router: Router, private socket: WebsocketService) {
    this.status = false;
  }

  

  ngOnInit(): void {

    const resStep = localStorage.getItem('settingsStep');
    const resStatus = localStorage.getItem('status');

    if (resStep !== null && !isNaN(Number(resStep))) {
      this.step = Number(resStep);
      if (resStatus !== null) {
        this.status = resStatus !== '0';
      }

      if (localStorage.getItem('programData') !== null) {
        const programData: ScreenData  = JSON.parse(localStorage.getItem('programData'));
        this.sexSelected = programData.sex;
        this.profile = programData.profile;
        this.height = programData.height;
        this.weight = programData.weight;
        this.doesChangeWeight = true;
        this.pip = programData.pip;
        this.peep = programData.peep;
        this.pmeseta = programData.pmeseta;
        this.mode = programData.mode;
        this.vol = programData.volume;
        this.freq = programData.freq;
        this.ti = programData.ti;
      }

      this.predictedVol = 8 * this.weight;
      this.comeFromDashboard = true;

      localStorage.removeItem('settingsStep');
      // localStorage.removeItem('programData');
    }

    this.checkAndApplyTheme();
  }

  onNewPressed() {
    this.step = 1;
  }

  onTabPressed(index) {
    this.patientTabSelected = index;
  }

  onConfTabPressed(index) {
    this.configTabSelected = index;
  }

  getSexDescription(): string {
    switch (this.sexSelected) {
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

  subsHeight() {
    this.height -= 0.01;

    if (!this.doesChangeWeight) {
      this.weight = this.height * 100 - 100;
    }
  }

  addHeight() {
    this.height += 0.01;

    if (!this.doesChangeWeight) {
      this.weight = this.height * 100 - 100;
    }
  }

  subsWeight() {
    this.weight -= 1;
    this.doesChangeWeight = true;
  }

  addWeight() {
    this.weight += 1;
    this.doesChangeWeight = true;
  }

  isContinuePosible(): boolean {
    return this.profile > -1;
  }

  onConfirm() {
    this.vol = 8 * this.weight;
    this.predictedVol = this.vol;
    this.isVolumeAlertOpen = true;
  }

  onConfirmVolume() {
    this.step = 2;
    this.isVolumeAlertOpen = false;
  }

  onBack() {
    if (this.comeFromDashboard && this.step === 3) {
      this.router.navigate(['/dashboard']);
    }

    if (this.routeOrigin !== undefined) {
      console.log(this.routeOrigin);
      this.step = Number(this.routeOrigin);
    } else {
      this.step--;
    }
  }

  goToStep(lstep, origin) {
    this.routeOrigin = origin;
    this.step = lstep;
  }

  onChangeMode(modeType) {
    this.mode = modeType;
    this.step++;
  }

  onConfirmVent() {
    const programData = new ScreenData();
    programData.sex = this.sexSelected;
    programData.profile = this.profile;
    programData.height = this.height;
    programData.weight = this.weight;
    programData.pip = this.pip;
    programData.peep = this.peep;
    programData.pmeseta = this.pmeseta;
    programData.mode = this.mode;
    programData.volume = this.vol;
    programData.freq = this.freq;
    programData.ti = this.ti;
    localStorage.setItem('programData', JSON.stringify(programData));
    localStorage.setItem('status', '2');
    this.router.navigate(['/dashboard']);
  }


  /***
   * keyboard
   * */
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
    this.valueIndex = toggle;
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
    this.valueIndex = 0;
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
    switch (this.valueIndex) {
      case 1:
        this.freq = Number(this.keyboardValue);
        break;
      case 2:
        this.ti = Number(this.keyboardValue);
        break;
      case 3:
        this.vol = Number(this.keyboardValue);
        break;
      case 4:
        this.pip = Number(this.keyboardValue);
        break;
      case 5:
        this.pmeseta = Number(this.keyboardValue);
        break;
      case 6:
        this.peep = Number(this.keyboardValue);
        break;
    }
    this.closeConfirm();
  }

  closeConfirm() {
    this.isChangeConfirmationOpen = false;
  }

  reset() {
    this.step = 0;
    this.patientTabSelected = 0;
    this.profile = -1;
    this.sexSelected = 0;
    this.mode = -1;
    this.height = 1.50;
    this.weight = 50;

    this.freq = 14;
    this.ti = 2;
    this.vol = 8;
    this.flow = 21;
    this.pip = 30;
    this.peep = 5;
    this.pmeseta = 15;
    this.doesChangeWeight = false;
  }


  getWeight(): number {
    if (this.doesChangeWeight) {
      return this.weight;
    }
    return this.height * 100 - 100;
  }

  onChangeThemePressed() {
    this.isDarkUI = !this.isDarkUI;
    localStorage.setItem('theme', this.isDarkUI ? '1' : '0' );
  }

  checkAndApplyTheme() {
    if (localStorage.getItem('theme') !== null) {
      this.isDarkUI = localStorage.getItem('theme') === '1';
    }
  }

  onBeginVentConfirmationPressed() {

    if (this.status === false) {
      this.beginVent = true;
    }else{
      const programData = new ScreenData();
      programData.sex = this.sexSelected;
      programData.profile = this.profile;
      programData.height = this.height;
      programData.weight = this.weight;
      programData.pip = this.pip;
      programData.peep = this.peep;
      programData.pmeseta = this.pmeseta;
      programData.mode = this.mode;
      programData.volume = this.vol;
      programData.freq = this.freq;
      programData.ti = this.ti;
      localStorage.setItem('programData', JSON.stringify(programData));
      localStorage.setItem('status', '1');
      this.router.navigate(['/dashboard']);
    }

  }

  pauseFirstAlert = false;
  shutDownAlert = false;
  onHalt() {
    if(this.status){
      this.pauseFirstAlert = true;
    }else{
      this.shutDownAlert = true;
    }
    //this.socket.sendData('#halt');
  }

  onConfirmShutdown(){
    this.router.navigate(['/shutdown']);
  }
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
