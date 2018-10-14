import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  Subject } from "rxjs";

import { AppService } from '../app.service';
import { EventType,
         Geo, Event } from '../status/status.interfaces';


@Injectable()
export class MobileService {
    constructor( public http: HttpClient,
                 private app: AppService ) { }
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getEventTypes() : Observable<EventType[]> {
        return this.http.get<EventType[]> ( this.app.uri('/models/eventtypes/') );
    } 
    
    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////
    getGeo() : Observable<Geo[]> {
        return this.http.get<Geo[]> ( this.app.uri('/geo/') );
    }

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////       
    postEvent(load) : Observable<Event> {
        return this.http.post<Event> ( this.app.uri('/events/'), load);
    }   

    ///////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////////////       
    sendAttach(form : FormData) : Observable<any> {
        return this.http.post<any> ( this.app.uri('/store/'), form );
    }
    
    makeAttach(id) : Observable<any> {
        return this.http.put<any> ( this.app.uri('/store/attach-event/'), id);
    }
}                                   