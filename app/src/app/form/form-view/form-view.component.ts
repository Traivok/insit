import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { FormService }  from '../form.service';
import { Fill, Form }   from '../form.interfaces';
import { Status }       from '../../status/status.interfaces';

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './form-view.component.html',
    styleUrls: ['./form-view.component.css'],
})
export class FormViewComponent implements OnInit {
    fill: Fill
    subject: Status;
    
    constructor( private route: ActivatedRoute,
                 private form: FormService ) { }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe(addr => {
            this.form.getFillId(addr as Form)
                .subscribe( data => {
                    this.fill = data;
                });            

            this.form.getStatus(addr as Form)
                .subscribe( data => {
                    this.subject = data;
                });            
        });
    }
}