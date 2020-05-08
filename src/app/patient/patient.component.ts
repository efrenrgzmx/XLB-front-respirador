import { Component, OnInit } from '@angular/core';
import {faChevronLeft, faMinus, faPlus} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.css']
})
export class PatientComponent implements OnInit {

  plusIcon = faPlus;
  minusIcon = faMinus;
  backIcon = faChevronLeft;

  step = 1;
  tabSelected = 0;
  profile = -1;
  sexSelected = 0;
  height = 1.50;
  constructor() { }

  ngOnInit(): void {
  }

  onNewPressed() {
    this.step = 1;
  }

  onTabPressed(index) {
    this.tabSelected = index;
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

}
