import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';

import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SortablejsOptions } from 'angular-sortablejs';


import { Status }       from '../../status/status.interfaces';
import { Fill, Question, 
         Unit, Form  }  from '../form.interfaces';
import { FormService }  from '../form.service';

import _map  from "lodash-es/map";
import _each from "lodash-es/each";
import _omit from "lodash-es/omit";
import _pick from "lodash-es/pick";
import _remove from "lodash-es/remove";


@Component({
    templateUrl: './form-edit.component.html',
    styleUrls: ['./form-edit.component.css']
})
export class FormEditComponent implements OnInit {
    id: Form;
    units: Unit[];
    quiz: Question[]
    subject: Status;
    
    options: SortablejsOptions = {
        handle: '.question-handle',
        onUpdate: (event: any) => {
            _each ( this.quiz, (q,i) => q.question_order = i+1 );
            const load = _map (this.quiz, q => _pick(q, ['question_id', 'question_order']));
            this.form.reorderQuestions(load)
                .subscribe();            
        },
    };

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    constructor( private route: ActivatedRoute,
                 private form: FormService ) {
        this.form.getUnits()
            .subscribe( data => {
                this.units = data;    
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    ngOnInit() {
        this.route.params.subscribe(addr => {
            this.form.getQuestions(addr as Form)
                .subscribe( data => {
                    this.id = _pick (addr, ['aspect_id', 'org_id']);
                    this.quiz = data;  
                });            

            this.form.getStatus(addr as Form)
                .subscribe( data => {
                    this.subject = data;
                });            
        });
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    onChange(q: Question) {
        q.dirty = true;
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    onUnitChange(q: Question, e: any) {
        q.unit_id = e.value.unit_id;
        q.dirty = true;
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save() : void {
        _each ( this.quiz, q => {
            const load = _omit (q, ['unit', 'dirty']);     
                 
            if ( q.question_id === undefined ) {
                this.form.postQuestion(q).subscribe( data => q = data );            
            } else {
                if ( q.dirty ) {
                    this.form.putQuestion(q,load).subscribe( data => q = data );            
                }
            }
        });
    }   
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    qdrop (q: Question) : void {
        if ( q.question_id === undefined ) {
            _remove (this.quiz, i => q == i);
        } else {
            this.form.delQuestion(q)
                .subscribe( data => {
                    _remove (this.quiz, i => q == i);
                });                
        }
    }
        
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    qnew () : void {
        const n = this.quiz.length+1;
        
        const q_desc = 'Questão #'+n+' para ' + 
                        (this.subject.aspect_desc) +
                        ' ('+this.subject.org_sigla+')'; 
        
        this.quiz.push({
            question_id:    undefined,
            question_desc:  q_desc, 
            question_text:  '', 
            question_base:  '',
            question_order: n,
            mandatory:      false,
            criterium_id:   0,
            weight:         1.0,
            unit_id:        1,
            org_id:         this.id.org_id,
            aspect_id:      this.id.aspect_id,
            number_ref:     undefined,
            number_upper:   undefined,
            tstamp_ref:     undefined,
            tstamp_upper:   undefined
        });
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // Unit Comparator
    compareFn: ((f1: any, f2: any) => boolean) | null = this.compareByValue;
    compareByValue(f1: any, f2: any) { 
        return f1 && f2 && f1.unit_id === f2.unit_id; 
    }
}