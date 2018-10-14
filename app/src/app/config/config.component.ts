import { Component, OnInit } from '@angular/core';
import { AppService } from  '../app.service';

@Component({
    templateUrl: 'config.component.html',
    styles: ['mat-card { margin: 16px; }', 
             '.active { background-color: lightgray }'],
})
export class ConfigComponent implements OnInit {
    constructor(private app: AppService) { }

    ngOnInit() {
        this.app.setTitle('Configurações');
    }
}
