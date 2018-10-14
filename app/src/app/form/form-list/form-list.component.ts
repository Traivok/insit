import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Status }       from '../../status/status.interfaces';
import { Form, Question,
         Fill, Answer } from '../form.interfaces';
import { FormService }  from '../form.service';

import _pick from "lodash-es/pick";

@Component({
    templateUrl: 'form-list.component.html',
    styleUrls: ['form-list.component.css']
})
export class FormListComponent implements OnInit {
    id: Form;
    fills: Fill[]
    subject: Status;
    
    constructor( private route: ActivatedRoute,
                 private form: FormService ) { }

    ngOnInit() {
       this.route.params.subscribe(addr => {
            this.form.getFills(addr as Form)    
                .subscribe( data => {
                    this.id = _pick (addr, ['aspect_id', 'org_id']);
                    this.fills = data;
                });            

            this.form.getStatus(addr as Form)
                .subscribe( data => {
                    this.subject = data;
                });            
        });
    }
}