import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { Status }       from '../../status/status.interfaces';
import { FormService }  from '../form.service';
import { Form, Question,
         Fill, Answer } from '../form.interfaces';

import _map  from "lodash-es/map";
import _each from "lodash-es/each";
import _omit from "lodash-es/omit";
import _pick from "lodash-es/pick";
import _extend from "lodash-es/extend";

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './form-fill.component.html',
    styleUrls: [],
})
export class FormFillComponent implements OnInit {
    id: Form;
    quiz: Question[]
    subject: Status;
    
    constructor( private route: ActivatedRoute,
                 private router: Router,
                 private form: FormService, 
                 private dialog: MatDialog ) { }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
       this.route.params.subscribe(addr => {
            this.form.getQuestions(addr as Form)
                .subscribe( data => {
                    this.id = _pick (addr, ['aspect_id', 'org_id']);
                    this.quiz = _map(data, q => {
                        q.answer = { 
                            fill_id: undefined,
                            answer_id: undefined,
                            question_id: q.question_id };
                        return q;
                    });
                });            

            this.form.getStatus(addr as Form)
                .subscribe( data => {
                    this.subject = data;
            });            
        });
    }
    
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    showText(t: string, s: string)  { 
        this.dialog.open(ShowTextDlg, {
            width: '50%',
            data: { title: t, text: s }
        });
    }
    
    getAnswer(q: Question) { 
        this.dialog
            .open(ShowInputDlg, {data: q} )
            .afterClosed()
            .subscribe(result => {
                switch (q.unit_id){
                    case 2:
                        q.answer.value_number = result;
                        break;
                    case 3:
                        q.answer.value_tstamp = result;
                        break;
                    case 4:
                        q.answer.value_image = result;
                        break;
                    default:
                        alert('type mismatch');
                        break;
                }
        });
    }
            
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save() : void {
        this.form.saveFill(this.id, _map (this.quiz, 'answer'))
            .subscribe(fill => {
                this.router.navigate(['../'+fill.fill_id], { relativeTo: this.route }); 
            });   
    }
}

/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
@Component({
    selector: 'show-text-dlg',
    template: ` <h1 mat-dialog-title>{{data.title}}<mat-divider></mat-divider></h1>
                <mat-dialog-content>{{data.text}}</mat-dialog-content>
                <mat-dialog-actions fxLayoutAlign="end">
                    <button mat-button mat-dialog-close>Close</button>
                </mat-dialog-actions>`,
})
export class ShowTextDlg {
    constructor( public dialogRef: MatDialogRef<ShowTextDlg>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
@Component({
    selector: 'show-input-dlg',
    templateUrl: 'show-input.dialog.html'
})
export class ShowInputDlg {
    value: any;
    
    constructor( public dialogRef: MatDialogRef<ShowInputDlg>,
        @Inject(MAT_DIALOG_DATA) public q: Question) { }

    onNoClick(): void {
        this.dialogRef.close(); 
    }

    sendPic ( s: string ) : void {
        this.dialogRef.close(s); 
    }
}
