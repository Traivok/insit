import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from "rxjs";

import { AppService }  from '../app.service';
import { Status }      from '../status/status.interfaces'; 
import { Fill, Form, 
         Unit, Question } from './form.interfaces';


@Injectable()
export class FormService {
    constructor( public http: HttpClient,
                 private app: AppService ) { }

    ///////////////////////////////////////////////////////////////////////////
    getUnits() : Observable<Unit[]> {
        return this.http.get<Unit[]> ( this.app.uri('/units/') )
    }
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getFills(addr: Form) : Observable<Fill[]> {
        const qs=`?org_id=${addr.org_id}&aspect_id=${addr.aspect_id}`;
        return this.http.get<Fill[]> ( this.app.uri('/fills/'+qs) );
    } 

    getFillId(addr) : Observable<Fill> {
        return this.http.get<Fill> ( this.app.uri('/fills/'+addr.fill_id) );
    } 

    saveFill(addr: Form, load) : Observable<Fill> {
        const param = `${addr.org_id}/${addr.aspect_id}`;
        return this.http.post<Fill> (this.app.uri('/fills/'+param), load);
    }

    getStatus(addr: Form) : Observable<Status> {
        const param = `${addr.org_id}/${addr.aspect_id}`;
        return this.http.get<Status> ( this.app.uri('/org/'+param) );
    } 
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    getQuestions(addr: Form) : Observable<Question[]> {
        const qs=`?org_id=${addr.org_id}&aspect_id=${addr.aspect_id}`;
        return this.http.get<Question[]> ( this.app.uri('/questions/'+qs) );
    }
    
    delQuestion(addr) : Observable<Question> {
        return this.http.delete<Question> ( this.app.uri('/questions/'+addr.question_id) );
    }
    
    putQuestion(addr,load) : Observable<Question> {
        return this.http.put<Question> ( this.app.uri('/questions/'+addr.question_id), load );
    }
    
    postQuestion(load) : Observable<Question> {
        return this.http.post<Question> ( this.app.uri('/questions/'), load );
    }
    
    reorderQuestions(load) : Observable<Question> {
        return this.http.post<Question> ( this.app.uri('/questions/reorder'), load );
    }
}