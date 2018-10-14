import { Component, OnInit } from '@angular/core';
import { AppService } from  '../../app.service';

@Component({
    templateUrl: 'about.component.html',
    styles: ['mat-card { margin: 16px;}']
})
export class AboutComponent implements OnInit {

    constructor(private app: AppService) { }

    ngOnInit() {
        this.app.setTitle('Sobre o Insit');
    }
}
