import { Component, OnInit } from '@angular/core';
import {ProgressBarMode} from '@angular/material/progress-bar';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  color: ThemePalette = 'primary';
  mode: ProgressBarMode = 'determinate';
  value = 90;
  bufferValue = 0;
  constructor() { }

  ngOnInit(): void {
  }

}
