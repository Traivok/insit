import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AppService }       from '../../app.service';
import { StatusService }    from '../status.service';
import { Geo, Count }       from '../status.interfaces';

@Component({
    templateUrl: './geo-detail.component.html',
    styleUrls: ['./geo-detail.component.css'],
})
export class GeoDetailComponent implements OnInit {
    id: any;
    geo: Geo;
    
    constructor( private route:  ActivatedRoute,
                 private status: StatusService,
                 private app:    AppService ) { }

    ngOnInit() {
        this.route.params.subscribe( addr => {
            this.id = addr;
            this.refresh();
        });
    }

    refresh() {
        this.status.getGeoId(this.id).subscribe(data => {
            this.geo = data;
            this.app.setTitle(this.geo.geo_name);

        }) 
    }
    
    post ( e: Count ) {
        this.status.postNewFakeEvent(e).subscribe(() => this.refresh());
    }
    
    toggle ( e: Count ) {
        this.status.enableEventTypeGeo(e).subscribe();
    }
}