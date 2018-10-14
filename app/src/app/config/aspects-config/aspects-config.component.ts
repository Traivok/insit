import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { SortablejsOptions } from 'angular-sortablejs';

import { AppService } from  '../../app.service';
import { ConfigService } from  '../config.service';
import { Aspect, Editable, Scale } from '../../status/status.interfaces';
import { IconChooserDlg } from '../icon-chooser/icon-chooser.dialog';


import _extend from "lodash-es/extend";
import _remove from "lodash-es/remove";
import _sortBy from "lodash-es/sortBy";
import _clone from "lodash-es/clone";
import _each from "lodash-es/each";
import _pick from "lodash-es/pick";
import _map from "lodash-es/map";

@Component({
    templateUrl: './aspects-config.component.html',
    styleUrls: ['./aspects-config.component.css'],
})
export class AspectsConfigComponent implements OnInit {
    scales:  Scale[];
    aspects: Aspect[];
    original: Aspect;
    
    options: SortablejsOptions = {
        handle: '.aspect-handle',
        onUpdate: (event: any) => {
            _each ( this.aspects, (q,i) => q.aspect_order = i+1 );
            const load = _map (this.aspects, q => _pick(q, ['aspect_id', 'aspect_order']));
            this.config.reorderAspects(load)
                .subscribe();            
        },
    };    
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    constructor( private dialog: MatDialog, 
                 private config: ConfigService,
                 private app: AppService ) { 
        
        this.config.getAspects()
            .subscribe((data) => {
                this.aspects = _sortBy(data, 'aspect_order');
            });

        this.config.getScales()
            .subscribe((data) => {
                this.scales = _sortBy(data, 'grade');
            });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.setTitle ('Configuração - Aspectos Organizacionais');
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    change(a: Editable) {
        a.dirty = true;
    }

    quit(a: Aspect) : void {
        _extend(a,this.original);
        a.editing = false;
        this.original = undefined;
    }
    
    edit(a: Aspect) : void {
        if ( !this.original ) {
            this.original = _clone(a);
            a.editing = true;
        }
    }
    
    icon(a: Aspect) : void {
        this.dialog
            .open(IconChooserDlg, {data: a})
            .afterClosed().subscribe( (icon) => {
                a.icon = icon || a.icon;
                a.dirty = !!(icon);
            });
    }
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save(a: Aspect) : void {
        const load = _pick(a,'aspect_desc', 'icon', 'aspect_order');
    
        if ( a.aspect_id === undefined ) {
            this.config.postAspect(load)
                .subscribe((data) => {
                    a.aspect_id = data.aspect_id;
                    a.editing = false;
                });            
        } else {
            this.config.putAspect(a,load)
                .subscribe(() => {
                    a.editing = false;
                });            
        }
    }   
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    drop (a: Aspect) : void {
        if ( a.aspect_id === undefined ) {
            _remove (this.aspects, i => a == i);
        } else {
            this.config.delAspect(a)
                .subscribe( data => {
                    _remove (this.aspects, i => a == i);
            });                
        }
    }
        
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    create () : void {
        this.aspects.push({
            aspect_id:      undefined,
            aspect_desc:    'Novo Aspecto',
            aspect_order:   this.aspects.length+1, 
            icon:           'code',
            route:          '',
            editing:        true,
        });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    update (s: Scale) : void {
        this.config.putScale(s,s)
            .subscribe(() => {
                s.editing = false;
            });
    }  
    
    touch(s: Scale) : void {
        s.editing = true;
    }
    
    done (s: Scale) : void {
        s.editing = false;
    }
}