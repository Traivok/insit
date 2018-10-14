import { Component, OnInit, ViewChild } from '@angular/core';

import {MatPaginator, MatTableDataSource} from '@angular/material';

import { AppService }       from '../../app.service';
import { StatusService }    from '../../status/status.service';

import { Event, Store,
         EventStatus, 
         EventType,
         Severity }         from  '../../status/status.interfaces';

@Component({
    templateUrl: './event-list.component.html',
    styleUrls: ['./event-list.component.css']
})
export class EventListComponent implements OnInit {
    @ViewChild('paginator') 
    paginator: MatPaginator;

    events: MatTableDataSource<Event>;
    cols: string[] = [ 'event_id', 'eventtype', 'bairro', 'regadm', 'eventstatus', 'severity'];
    
    constructor( private status: StatusService,
                 private app:    AppService) { 
        this.app.setTitle('Ocorrências');
    }

    ngOnInit() {
        this.status.getEvents().subscribe( data => {
            this.events = new MatTableDataSource<Event>(data);
        })
    }
    
    
    applyFilter(f: string) {
        const str = f.trim().toLowerCase();
        console.log(str);
        this.events.filter = str;
    }
}
