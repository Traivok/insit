import { Component, OnInit } from '@angular/core';
import { AppService } from  '../../app.service';

@Component({
    templateUrl: './front-page.component.html',
    styleUrls: ['./front-page.component.css'],
})
export class FrontPageComponent implements OnInit {

    constructor(private app: AppService) { }

    ngOnInit() {
        this.app.setTitle('Inteligência Situacional');
    }
}
