import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Aspect, Status }   from '../status.interfaces';
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

@Component({
    templateUrl: './sit-status.component.html',
    styleUrls: ['./sit-status.component.css'],
})
export class SitStatusComponent implements OnInit {
    orgsit: Status[];
    mobile: boolean;

    constructor( private route:  ActivatedRoute,
                 private status: StatusService,
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
        this.route.params.subscribe( addr => {
            this.status.getAspectId(addr)
                .subscribe(data => { 
                    this.app.setTitle(data.aspect_desc + ' - Situação Geral');
                }); 

            this.status.getOrgSit(addr)
                .subscribe(data => this.orgsit = data);
        });
    }

    onChangeLayout() {
        this.mobile = this.breakpointObserver.isMatched('(max-width: 599px)');
    }
}
