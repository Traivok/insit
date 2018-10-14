import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from "rxjs";


import _pick from "lodash-es/pick";

import { AppService }  from '../app.service';

import { Org, Aspect, Status, 
         Geo, EventType, EventStatus, 
         Event, EventGeo, Severity } from './status.interfaces';


@Injectable()
export class StatusService {
    constructor( public http: HttpClient,
                 private app: AppService ) { }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getDTB() : Observable<any> {
        return this.http.get ( this.app.uri('/dtb') );
    } 
    
    getDTBId(id) : Observable<any> {
        return this.http.get ( this.app.uri('/dtb/'+id.geo_id) );
    }
    
    getGeoColors(id) : Observable<any> {
        return this.http.get ( this.app.uri('/dtb/colors/'+id.eventtype_id) );
    }
    

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getAspects() : Observable<Aspect[]> {
        return this.http.get<Aspect[]> ( this.app.uri('/models/aspects/') );
    } 
    
    getAspectId(id) : Observable<Aspect> {
        return this.http.get<Aspect> ( this.app.uri('/models/aspects/'+id.aspect_id) );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getSeverities() : Observable<Severity[]> {
        return this.http.get<Severity[]> ( this.app.uri('/models/severities/') );
    } 
    
    getSeverityId(id) : Observable<Severity> {
        return this.http.get<Severity> ( this.app.uri('/models/severities/'+id.severity_id) );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getEventTypes() : Observable<EventType[]> {
        return this.http.get<EventType[]> ( this.app.uri('/models/eventtypes/') );
    } 
    
    getEventType(id) : Observable<EventType> {
        return this.http.get<EventType> ( this.app.uri('/models/eventtypes/'+id.eventtype_id) );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getEventStatii() : Observable<EventStatus[]> {
        return this.http.get<EventStatus[]> ( this.app.uri('/models/eventstatus/') );
    } 
    
    getEventStatus(id) : Observable<EventStatus> {
        return this.http.get<EventStatus> ( this.app.uri('/models/eventstatus/'+id.eventstatus_id) );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getGeo() : Observable<Geo[]> {
        return this.http.get<Geo[]> ( this.app.uri('/geo/') );
    }

    getGeoId(id) : Observable<Geo> {
        return this.http.get<Geo> ( this.app.uri('/geo/'+id.geo_id) );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getOrg() : Observable<Org[]> {
        return this.http.get<Org[]> ( this.app.uri('/org/') );
    }
    
    getOrgId(id) : Observable<Org> {
        return this.http.get<Org> ( this.app.uri('/org/'+id.org_id) );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getGeoSit(id) : Observable<Status[]> {
        return this.http.get<Status[]> ( this.app.uri('/geo/aspects/'+id.aspect_id) );
    }

    getOrgSit(id) : Observable<Status[]> {
        return this.http.get<Status[]> ( this.app.uri('/org/aspects/'+id.aspect_id) );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    setGrade ( e: Status ) : Observable<any> {
        const params = `${e.org_id}/${e.aspect_id}`;
        const load = { grade: e.grade || 0 };
        return this.http.post ( this.app.uri('/org/'+params), load );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    delGrade ( e: Status ) : Observable<any> {
        const params = `${e.org_id}/${e.aspect_id}`;
        return this.http.delete ( this.app.uri('/org/'+params) );
    }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getEvents() : Observable<Event[]> {
        return this.http.get<Event[]> ( this.app.uri('/events/') );
    }

    getEventId(id) : Observable<Event> {
        return this.http.get<Event> ( this.app.uri('/events/'+id.event_id) );
    }

    
    saveEvent(id, load) : Observable<Event> {
        return this.http.put<Event> ( this.app.uri('/models/events/'+id.event_id), load );
    }

    
    getFilteredEvents(id) : Observable<Event[]> {
        const qs = `eventtype_id=${id.eventtype_id}&geo_id=${id.geo_id}`;
        return this.http.get<Event[]> ( this.app.uri('/events?'+qs) );
    }
        
    ///////////////////////////////////////////////////////////////////////////////////
    enableEventTypeGeo (id) : Observable<EventGeo> {
        const loc = id.eventtype_id + '/' + id.geo_id;
        const load = { enabled: id.enabled || false };
        return this.http.put<EventGeo> ( this.app.uri('/events/enable/'+loc), load);
        
    } 
        
    postNewFakeEvent(id) : Observable<Event> {
        const loc = id.eventtype_id + '/' + id.geo_id;
        return this.http.post<Event> ( this.app.uri('/events/fake/'+loc), {});
    }    
}