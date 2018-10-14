import { Component, ViewChild, OnInit } from '@angular/core';

import { MatSidenav } from '@angular/material/sidenav';

import { AppService    } from './app.service';
import { AuthService   } from './auth/auth.service';
import { StatusService } from './status/status.service';
import { Aspect }        from './status/status.interfaces';
 

@Component({
    selector: 'insit-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.css']
})
export class AppComponent implements OnInit {
    
@ViewChild('sidenav') sidenav: MatSidenav;    
    client:  string;
    title:   string;
    aspects: Aspect[];
    profile: any;
    
    constructor( private    app: AppService,
//                 public    auth: AuthService,
                 private status: StatusService ) { 
//        auth.handleAuthentication();
//        auth.scheduleRenewal();
    }    

    ngOnInit() {   
//        this.auth.getProfile()
//            .subscribe( p => this.profile = p);
        
//        this.auth.getStatus()
//            .subscribe (isIn => { });

        this.client = this.app.getClientName();
        
        this.status.getAspects()    
            .subscribe( data => this.aspects = data );    
    
        this.app.title$
            .subscribe( data => this.title = data );
    }
}
