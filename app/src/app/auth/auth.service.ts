import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable ,  BehaviorSubject } from 'rxjs';




import { environment } from '../../environments/environment';

import * as auth0 from 'auth0-js';


@Injectable()
export class AuthService {

    public redirectUrl: string;
    
    private refreshSubscription: any;
    private usrPolicy:  BehaviorSubject<any>     = new BehaviorSubject(null);
    private usrProfile: BehaviorSubject<any>     = new BehaviorSubject(null);
    private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

    auth0 = new auth0.WebAuth({
        clientID: 'nn3LAp3BCDuW8202R9Y2gZwH5G0btvwf',
        domain: 'nyxk.auth0.com',
        responseType: 'token id_token',
        audience: 'urn:api:nyx:oneco:checks',
        redirectUri: environment.redirectURL,
        scope: 'openid profile'
        });

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    constructor( private http: HttpClient, 
                 private router: Router ) { }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public login(redirectUri: string): void {
        this.auth0.authorize(redirectUri);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public logout(): void {
        // Remove tokens and expiry time from localStorage
        this.clearSession();

        // Go back to the home route
        this.router.navigate(['/']);
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getProfile(): BehaviorSubject<any> {
        return this.usrProfile;
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getPolicy(): BehaviorSubject<any> {
        return this.usrPolicy;        
    }  
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public getStatus(): BehaviorSubject<boolean> {
        return this.isLoggedIn;        
    }    
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public handleAuthentication(): void {
        this.auth0.parseHash((err, authResult) => {
            if (authResult && authResult.accessToken && authResult.idToken) {
                window.location.hash = '';
                this.setSession(authResult);
                this.router.navigate(['/profile']);
            } else if (err) {
                this.clearSession;
                this.router.navigate(['/about']);
            } else {    // Reloading, update Observables 
                this.isLoggedIn.next(true);
                let profile = JSON.parse(localStorage.getItem('profile'));
                profile ? this.usrProfile.next(profile) : this.logout();
                
                let policy = JSON.parse(localStorage.getItem('policy'));
                policy ? this.usrPolicy.next(policy) : this.logout();
            }
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public isAuthenticated(): boolean {
        // Check whether the current time is past the access token's expiry time
        const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
        return (new Date().getTime() < expiresAt);
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public renewToken() {
        this.auth0.checkSession({}, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                this.setSession(result);
            }
        });
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public scheduleRenewal() {
        if(!this.isAuthenticated()) 
            return;
        
        this.unscheduleRenewal();

        const expiresAt = JSON.parse(window.localStorage.getItem('expires_at'));

        const source = Observable.of(expiresAt).flatMap(expiresAt => {
            const now = Date.now();

            // Use the delay in a timer to
            // run the refresh at the proper time
            return Observable.timer(Math.max(1, expiresAt - now));
            });

        // Once the delay time from above is
        // reached, get a new JWT and schedule
        // additional refreshes
        this.refreshSubscription = source.subscribe(() => {
            this.renewToken();
            this.scheduleRenewal();
        });
    }

    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    public unscheduleRenewal() {
        if(!this.refreshSubscription) 
            return;
        this.refreshSubscription.unsubscribe();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private setSession(authResult): void {        
        // Set the time that the access token will expire at
        const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('expires_at', expiresAt);
        this.isLoggedIn.next(true);               
        
        console.log(authResult)
        
        const self = this;
        this.auth0.client.userInfo(authResult.accessToken, (err, profile) => {
            if (err) { console.log(err); }
            
            localStorage.setItem('profile', JSON.stringify(profile) );
            self.usrProfile.next(profile);
        });
        
        const id = authResult.idTokenPayload;
        this.http.get (environment.baseURL+'/auth/'+id.sub +'/'+id.aud)
            .subscribe ( policy => {
                localStorage.setItem('policy', JSON.stringify(policy) );
                self.usrPolicy.next(policy) 
            });
        
        this.scheduleRenewal();
    }
    
    ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////
    private clearSession() : void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('expires_at');
        localStorage.removeItem('profile');
        localStorage.removeItem('policy');
        
        this.usrProfile.next(null);
        this.usrPolicy.next(null);
        this.isLoggedIn.next(false);
    }    
}