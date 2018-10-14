import { Component, OnInit } from '@angular/core';
import { ActivatedRoute }   from '@angular/router';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Org, Status }      from '../status.interfaces';

import _extend from "lodash-es/extend";

@Component({
    templateUrl: './org-detail.component.html',
    styleUrls: ['./org-detail.component.css'],
})
export class OrgDetailComponent implements OnInit {
    org: Org;
    
    constructor( private route:  ActivatedRoute,
                 private status: StatusService,
                 private app:    AppService ) { }

    ngOnInit() {
        this.route.params.subscribe( addr => {
            this.status.getOrgId(addr).subscribe( data => {
                this.org = data;
                this.app.setTitle(this.org.org_name);
            })
        });
    }

    change ( e: Status ) : void { 
        this.status.setGrade(e).subscribe( data => {
            const a = this.org.status.find ( i => i.aspect_id == e.aspect_id );
            _extend ( a, data);
            });
    }
    
    save ( e: Status ) {
        const a = this.org.status.find ( i => i.aspect_id == e.aspect_id );
        if ( !a.has_aspect ) {
            this.status.delGrade(e).subscribe(() => a.has_aspect = false);
        } else {
            this.status.setGrade(e).subscribe(() => a.has_aspect = true);
        }
    }
}