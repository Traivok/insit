import { Component, OnInit } from '@angular/core';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Org }              from '../status.interfaces';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
    templateUrl: './org-status.component.html',
    styleUrls: ['./org-status.component.css'],
})
export class OrgStatusComponent implements OnInit {    
    tiles: Org[];
    mobile: boolean;

    constructor ( private status: StatusService,
                  private app:    AppService,
                  private breakpointObserver: BreakpointObserver ) {
        breakpointObserver.observe([
            Breakpoints.HandsetLandscape,
            Breakpoints.HandsetPortrait
        ]).subscribe(result => {
            if (result.matches) {
                this.onChangeLayout();
            }
        });
    }
    
    ngOnInit() {
        this.onChangeLayout();
        this.status.getOrg().subscribe ( data => this.tiles = data );
        this.app.setTitle('Situação Organizacional');
    }

    onChangeLayout() {
        this.mobile = this.breakpointObserver.isMatched('(max-width: 599px)');
    }
}
