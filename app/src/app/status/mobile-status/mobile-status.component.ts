import {Component, Input, OnInit} from '@angular/core';
import {Status} from "../status.interfaces";

@Component({
  selector: 'mobile-insit-status',
  templateUrl: './mobile-status.component.html',
  styleUrls: ['./mobile-status.component.css']
})
export class MobileStatusComponent implements OnInit {
  @Input() status: Status[];

  constructor() { }

  ngOnInit() {
  }

  rgba ( a: number[] ) : string {
    const color = !!a ? `rgba(${a[0]},${a[1]},${a[2]},${a[3]})` :
        'rgba(255,255,255,1)';
    return color;
  }
}
