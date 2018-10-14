import { Component, Input } from '@angular/core';
import { Count } from '../status.interfaces';

@Component({
    selector: 'insit-counts',
    templateUrl: './counts.component.html',
    styleUrls: ['./counts.component.css'],
})
export class CountsComponent {
    @Input() counts: Count[];
    constructor() { }
}