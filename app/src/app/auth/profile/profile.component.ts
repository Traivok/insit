import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
    profile: any;
    policy:  any;
    
    constructor( private auth: AuthService ) { }

    ngOnInit() {
        this.auth.getProfile().subscribe( v => this.profile = v );
        this.auth.getPolicy( ).subscribe( v => this.policy = v );
    }
}
