import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Aspect, Status }   from '../status.interfaces';

@Component({
    templateUrl: './sit-status.component.html',
    styleUrls: ['./sit-status.component.css'],
})
export class SitStatusComponent implements OnInit {
    orgsit: Status[];
    
    constructor( private route:  ActivatedRoute,
                 private status: StatusService,
                 private app:    AppService ) { }

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
}