import { Component, OnInit } from '@angular/core';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Geo }              from '../status.interfaces';

@Component({
    templateUrl: './geo-status.component.html',
    styleUrls: ['./geo-status.component.css'],
})
export class GeoStatusComponent implements OnInit {
    tiles: Geo[];

    constructor ( private status: StatusService,
                  private app:    AppService ) { }

    ngOnInit() {
        this.status.getGeo().subscribe ( data => this.tiles = data );
        this.app.setTitle('Situação Geográfica');
    }
}