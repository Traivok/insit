import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../auth/auth.service';

import _includes from "lodash-es/includes";

@Directive({ selector: '[nyxAuth]'})
export class AuthDirective {

    constructor(
        private auth: AuthService,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef ) { }

    @Input() set nyxAuth( scope: string ) {        
        this.auth.getPolicy().subscribe(policies => {
            policies && _includes(policies.permissions,scope) ?
                this.viewContainer.createEmbeddedView(this.templateRef) :
                this.viewContainer.clear();
        });
    }
}