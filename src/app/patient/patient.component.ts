import { Component, OnInit } from '@angular/core';
import {faChevronLeft, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  isDarkUI = false;

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




  routeOrigin = undefined;

  plusIcon = faPlus;
  minusIcon = faMinus;
  backIcon = faChevronLeft;

  step = 0;
  doesFromSummary = false;

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
  pmeseta = 15;

  configTabSelected = 0;
  beginVent = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
    const resStep = localStorage.getItem('settingsStep');

    if (!isNaN(Number(resStep))) {
      this.step = Number(resStep);
      localStorage.removeItem('settingsStep');
    }
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

  subsHeight(){
    this.height -= 0.01;

    if (!this.doesChangeWeight) {
      this.weight = this.height * 100 - 100;
    }
  }

  addHeight(){
    this.height += 0.01;

    if (!this.doesChangeWeight) {
      this.weight = this.height * 100 - 100;
    }
  }

  subsWeight(){
    this.weight -= 1;
    this.doesChangeWeight = true;
  }

  addWeight(){
    this.weight += 1;
    this.doesChangeWeight = true;
  }

  isContinuePosible(): boolean {
    if (this.profile > -1) {
      return true;
    } else {
      return false;
    }
  }

  onConfirm() {
    this.step = 2;
  }

  onBack() {

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
    this.router.navigate(['/dashboard']);
  }





  /***
   * keyboard
   * */
  onDigitPressed(digit: string) {
    if(this.isFirstChangeDone === false && digit !== '-') {
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

  openKeyboard(valueIndex, currentValue: number, desc: string, min: number, max: number, unit: string) {
    this.cleanKeyboardData();
    this.valueIndex = valueIndex;
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
      case 4:
        this.pmeseta = Number(this.keyboardValue);
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
    this.pmeseta = 15;
    this.doesChangeWeight = false;
  }

  getWeight(): number {
    if (this.doesChangeWeight) {
      return this.weight;
    }
    return this.height * 100 - 100;
  }
}
