import { Component,
         Inject,
         ViewChild }        from '@angular/core';

import { MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { AppService }       from '../../app.service';


@Component({
    template:  `<mat-dialog-content>
                    <div #mediaElement></div>
                </mat-dialog-content>
                <mat-dialog-actions fxFlexAlign="end" fxLayout="row" fxLayoutAlign="end">
                    <button mat-button [matDialogClose]="null">Fechar</button>
                </mat-dialog-actions>`,
})
export class ShowMediaEventDlg {
    @ViewChild('mediaElement') 
    media: any;
    elem:  any;
    type:  string;
    
    constructor( @Inject(MAT_DIALOG_DATA) 
                 public data: any,
                 public dialogRef: MatDialogRef<ShowMediaEventDlg>,
                 public app: AppService ) { 
        
        this.type = this.data.mimetype.split('/')[0];
    }

    ngOnInit() {        
        if ( this.type == 'image') {
            this.elem = new Image(960,720);
        } else if ( this.type == 'video' ) {
            this.elem = document.createElement('video');
            this.elem.autoplay = false;
            this.elem.controls = true;
        } else if  ( this.type == 'audio' ) {
            this.elem = document.createElement('audio');
            this.elem.autoplay = false;
            this.elem.controls = true;
        }
     
        this.elem.src = this.app.uri('/store/'+this.data.store_id);
        this.media.nativeElement.appendChild(this.elem);
    }
    
    onNoClick(): void {
        this.dialogRef.close(); 
    }
}