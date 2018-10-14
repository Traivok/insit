import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { SortablejsOptions } from 'angular-sortablejs';

import { AppService } from  '../../app.service';
import { ConfigService } from  '../config.service';
import { EventType, EventStatus, Editable, Severity } from '../../status/status.interfaces';
import { IconChooserDlg } from '../icon-chooser/icon-chooser.dialog';

import _extend from "lodash-es/extend";
import _remove from "lodash-es/remove";
import _sortBy from "lodash-es/sortBy";
import _clone from "lodash-es/clone";
import _each from "lodash-es/each";
import _pick from "lodash-es/pick";
import _map from "lodash-es/map";


@Component({
    templateUrl: './events-config.component.html',
    styleUrls: ['./events-config.component.css'],
})
export class EventsConfigComponent implements OnInit {
    eventstatii:  EventStatus[];
    original_es: EventStatus;
    
    severities:  Severity[];
    
    eventtypes: EventType[];
    original_et: EventType;
    
    
    options_et: SortablejsOptions = {
        handle: '.eventtypes-handle',
        onUpdate: (event: any) => {
            _each ( this.eventtypes, (q,i) => q.eventtype_order = i+1 );
            const load = _map (this.eventtypes, q => _pick(q, ['eventtype_id', 'eventtype_order']));
            this.config.reorderEventTypes(load)
                .subscribe();
        },
    };    
    
    options_es: SortablejsOptions = {
        handle: '.eventstatii-handle',
        onUpdate: (event: any) => {
            _each ( this.eventstatii, (q,i) => q.eventstatus_order = i+1 );
            const load = _map (this.eventstatii, q => _pick(q, ['eventstatus_id', 'eventstatus_order']));
            this.config.reorderEventStatii(load)
                .subscribe();
        },
    };    
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    constructor( private dialog: MatDialog, 
                 private config: ConfigService,
                 private app: AppService ) { 
        
        this.config.getEventTypes()
            .subscribe((data) => {
                this.eventtypes = _sortBy(data, 'eventtype_order');
            });

        this.config.getEventStatii()
            .subscribe((data) => {
                this.eventstatii = _sortBy(data, 'eventstatus_order');
            });

        this.config.getSeverities()
            .subscribe((data) => {
                this.severities = _sortBy(data, 'severity_id');
            });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.setTitle ('Configuração - Tipos de Eventos');
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    change(e: Editable) : void {
        e.dirty = true;
    }
        
    icon(a: any) : void {
        this.dialog
            .open(IconChooserDlg, {data: a})
            .afterClosed().subscribe((icon) => {
                if (icon) {
                    a.icon = icon || a.icon;
                    a.dirty = !!(icon);
                }
            });
    }
    
    edit_et(a: EventType) : void {
       if ( !this.original_et ) {
            this.original_et = _clone(a);
            a.editing = true;
        }
    }
    
    quit_et(a: EventType) : void {
        _extend(a,this.original_et);
        a.editing = false;
        this.original_et = undefined;
        if ( !a.eventtype_id )
            this.drop_et(a);
        
    }
    
    edit_es(a: EventStatus) : void {
       if ( !this.original_es ) {
            this.original_es = _clone(a);
            a.editing = true;
        }
    }
    
    quit_es(a: EventStatus) : void {
        _extend(a,this.original_es);
        a.editing = false;
        this.original_es = undefined;
        if ( !a.eventstatus_id )
            this.drop_es(a);
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save_es(a: EventStatus) : void {
        const load = _pick(a,'eventstatus_desc', 'icon', 'eventstatus_order');
        const done = (e) => { e.editing = false; this.original_es = undefined; }
    
        if ( a.eventstatus_id === undefined ) {
            this.config.postEventStatus(load)
                .subscribe((data) => {
                    a.eventstatus_id = data.eventstatus_id;
                    done(a);
                }, () => done(a) );            
        } else {
            this.config.putEventStatus(a,load)
                .subscribe(() => done(a), 
                           () => done(a) );            
        }
    }   
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save_et(a: EventType) : void {
        const load = _pick(a,'eventtype_desc', 'icon', 'eventtype_order');
        const done = (e) => { e.editing = false; this.original_et = undefined; }
        
        if ( a.eventtype_id === undefined ) {
            this.config.postEventType(load)
                .subscribe((data) => {
                    a.eventtype_id = data.eventtype_id;
                    done(a);
                }, () => done(a) );            
        } else {
            this.config.putEventType(a,load)
                .subscribe(() => done(a), 
                           () => done(a) );            
        }
    }   
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    drop_et (a: EventType) : void {
        if ( a.eventtype_id === undefined ) {
            _remove (this.eventtypes, i => a == i);
        } else {
            this.config.delEventType(a)
                .subscribe( data => {
                    _remove (this.eventtypes, i => a == i);
            });                
        }
    }
        
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    drop_es (a: EventStatus) : void {
        if ( a.eventstatus_id === undefined ) {
            _remove (this.eventstatii, i => a == i);
        } else {
            this.config.delEventStatus(a)
                .subscribe( data => {
                    _remove (this.eventstatii, i => a == i);
            });                
        }
    }
        
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    create_et () : void {
        this.eventtypes.push({
            eventtype_id:     undefined,
            eventtype_desc:   'Novo Aspecto',
            eventtype_order:  this.eventtypes.length+1, 
            icon:           'code',
            route:          '',
            marker:         '',
            dirty:          true,
            editing:        true,
        });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    create_es () : void {
        this.eventstatii.push({
            eventstatus_id:     undefined,
            eventstatus_desc:   'Novo Aspecto',
            eventstatus_order:  this.eventstatii.length+1, 
            icon:           'code',

            dirty:          true,
            editing:        true,
        });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    update (s: Severity) : void {
        this.config.putSeverity(s,s)
            .subscribe(() => {
                s.dirty = false;
            });
    }   
    
    
    touch (s: Severity) : void {
        s.dirty = true;
    }
}