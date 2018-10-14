import { Component, Input } from '@angular/core';
import { Status } from '../status.interfaces';

@Component({
    selector: 'insit-status',
    templateUrl: './status.component.html',
    styleUrls: ['./status.component.css'],
})
export class StatusComponent {
    @Input() status: Status[];
    constructor() { }

    rgba ( a: number[] ) : string {
        const color = !!a ? `rgba(${a[0]},${a[1]},${a[2]},${a[3]})` :
                            'rgba(255,255,255,1)';
        return color;
    }
}