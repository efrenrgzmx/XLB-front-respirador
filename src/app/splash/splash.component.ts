import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {
  isDarkUI = false;
  beginFade = false;

  constructor(public router: Router) { }

  ngOnInit(): void {
    (async () => {
      await this.delay(1500);
      this.beginFade = true;
      await this.delay(2000);
      this.router.navigate(['/dashboard']);
    })();
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

}
