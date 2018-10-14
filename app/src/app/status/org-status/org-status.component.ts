import { Component, OnInit } from '@angular/core';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Org }              from '../status.interfaces';

@Component({
    templateUrl: './org-status.component.html',
    styleUrls: ['./org-status.component.css'],
})
export class OrgStatusComponent implements OnInit {    
    tiles: Org[];
    
    constructor ( private status: StatusService,
                  private app:    AppService ) { }
    
    ngOnInit() {
        this.status.getOrg().subscribe ( data => this.tiles = data );
        this.app.setTitle('Situação Organizacional');
    }
}
