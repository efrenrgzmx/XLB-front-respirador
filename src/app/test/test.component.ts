import { Component, OnInit } from '@angular/core';
import {ProgressBarMode} from '@angular/material/progress-bar';
import {ThemePalette} from '@angular/material/core';
import {faCheck, faTimes} from '@fortawesome/free-solid-svg-icons';
import {Router} from '@angular/router';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  // declarations

  isDarkUI = false;

  // bar
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 0;
  bufferValue = 0;

  // icons
  closeIcon = faTimes;
  checkIcon = faCheck;

  // tests
  /**
   * results status:
   * 0 : in process
   * 1 : success
   * 2 : error
   */
  results = [];
  titles = [];

  // screen control
  finishTests = false;



  constructor(private router: Router) {
    this.results.push(...[0, 0, 0, 0]);
    this.titles.push(...['test case 1', 'test case 2', 'test case 3', 'test case 4' ])
  }

  ngOnInit(): void {
    this.checkAndApplyTheme();

    (async () => {
      await this.delay(1500);
      this.value += 5;
      this.results[0] = 1;
      await this.delay(200);
      this.value += 25;
      this.results[1] = 1;
      await this.delay(1500);
      this.value += 35;
      this.results[2] = 1;
      await this.delay(1200);
      this.value += 65;
      this.results[3] = 1;

      this.finishTests = true;
      await this.delay(200);
      this.router.navigate(['/patient']);
    })();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  checkAndApplyTheme() {
    if (localStorage.getItem('theme') !== null) {
      this.isDarkUI = localStorage.getItem('theme') === '1';
    }
  }
}
