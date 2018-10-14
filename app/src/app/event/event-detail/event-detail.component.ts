import { Component, OnInit} from '@angular/core';
import { ActivatedRoute }   from '@angular/router';
import { MatDialog }        from '@angular/material';
import { AppService }       from '../../app.service';
import { StatusService }    from '../../status/status.service';

import { Event, Store,
         EventStatus, 
         EventType,
         Severity }         from  '../../status/status.interfaces';

import { ShowMediaEventDlg} from '../show-media/show-media.dialog';

import _pick from "lodash-es/pick";
//import _find from "lodash-es/find";

@Component({
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
    event:      Event;
    e_old:      Event;
    
    eventstatii:    EventStatus[];
    severities:     Severity[];
    
    constructor( private route:  ActivatedRoute,
                 private dialog: MatDialog,  
                 private status: StatusService,
                 private app:    AppService) { 
    
        this.app.setTitle('Ocorrência');
        
        this.status.getEventStatii()
            .subscribe( data => this.eventstatii = data );
        
        this.status.getSeverities()
            .subscribe( data => this.severities = data );

        this.route.params.subscribe( addr => {
            this.status.getEventId(addr).subscribe( data => {
                this.event = data;
                this.e_old = data;
            })
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    ngOnInit() {
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////////
    save() {
        const load = _pick(this.event, ['eventstatus_id', 'severity_id']);
        
        this.status.saveEvent(this.event, load)
            .subscribe( () => {

                this.event.status   = this.eventstatii.find(i => i.eventstatus_id == this.event.eventstatus_id );            
                this.event.severity = this.severities.find (i => i.severity_id    == this.event.severity_id );            
            
//                const es = _pick(this.event,'eventstatus_id');
//                const sv = _pick(this.event,'severity_id');
//            
//                this.event.status   = _find (this.eventstatii,es);            
//                this.event.severity = _find (this.severities,sv);            
            });
    }
    
    ///////////////////////////////////////////////////////////
    show(m) {
        this.dialog
            .open(ShowMediaEventDlg, {data: m})
            .afterClosed()
            .subscribe();
    }

    ///////////////////////////////////////////////////////////
    undo() {
        this.event = this.e_old;
    }

    ///////////////////////////////////////////////////////////
    drop(m) {
        
    }
}






