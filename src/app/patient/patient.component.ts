import { Component, OnInit } from '@angular/core';
import {faChevronLeft, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

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



  // controlled mode
  timeSelected = 0;
  freq = 14;
  ie = 2;
  vol = 8;
  flow = 21;
  volMaxMin = 400;

  configTabSelected = 0;
  beginVent = false;
  constructor(private router: Router) { }

  ngOnInit(): void {
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
  }

  addHeight(){
    this.height += 0.01;
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
    this.step--;
  }

  onChangeMode(modeType) {
    this.mode = modeType;
    this.step++;
  }

  changeFreq(isAdding: boolean) {
    if (isAdding === true) {
      this.freq++;
    } else {
      this.freq--;
    }
  }

  changeIE(isAdding: boolean) {
    if (isAdding === true) {
      this.ie++;
    } else {
      this.ie--;
    }
  }

  changeVolumen(isAdding: boolean) {
    if (isAdding === true) {
      this.vol++;
    } else {
      this.vol--;
    }
  }

  changeFlow(isAdding: boolean) {
    if (isAdding === true) {
      this.flow++;
    } else {
      this.flow--;
    }
  }

  changeVolMaxMin(isAdding: boolean) {
    if (isAdding === true) {
      this.volMaxMin++;
    } else {
      this.volMaxMin--;
    }
  }

  onConfirmVent() {
    this.router.navigate(['/dashboard']);
  }
}
