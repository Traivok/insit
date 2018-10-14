import { Component, OnInit,
         ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, 
         FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import { SortablejsOptions } from 'angular-sortablejs';

import { AppService }    from  '../../app.service';
import { ConfigService } from  '../config.service';
import { Org, Editable } from '../../status/status.interfaces';

import _remove      from "lodash-es/remove";
import _sortBy      from "lodash-es/sortBy";
import _range       from "lodash-es/range";
import _pick        from "lodash-es/pick";
import _map         from "lodash-es/map";


@Component({
    templateUrl: './orgs-config.component.html',
    styleUrls: ['./orgs-config.component.css'],
})
export class OrgsConfigComponent implements OnInit {
    @ViewChild('target', {read: ElementRef})
    target: ElementRef;
    
    orgs: Org[]; 
    
    dragged: Org;
    dropped: Org;
    
    /////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////
    getPrevSibling(a: Org) : Org {
        return this.orgs
                    .slice(0, this.orgs.findIndex(o => o.org_id == a.org_id) )
                    .reverse()
                    .find(o => ( o.parent_org_id ==  a.parent_org_id) 
                            || (!o.parent_org_id && !a.parent_org_id) );
    }
    
    private getParentNextSibling(a: Org) : Org {
        const i = this.orgs.findIndex(o => o.org_id == a.org_id);
        const p = this.getOrgOf(a.parent_org_id);
        return this.orgs.slice(i+1)
                    .find(o => o.parent_org_id == p.parent_org_id);
    }   
    
    private getParent(a: Org) : Org {
        return this.orgs.find(o => o.org_id == a.parent_org_id);
    }

    private getOrgOf (a) : Org {
        return this.orgs.find ( o => o.org_id == parseInt(a) );
    }
    
    private hasChildren(a: Org) : boolean {
        return this.orgs.some ( o => o.parent_org_id == a.org_id );    
    }

    private repath () {        
        this.orgs.forEach( o => {
            o.path = [o.org_id];
            
            let a: Org = o;
            while( a.parent_org_id ) {
                a = this.getOrgOf(a.parent_org_id);
                o.path.push(a.org_id);
            }
        });
    }    
    
    private reorder() {
        const kids = this.target.nativeElement.children;

        const orgs = [];
        for ( let i=0; i<this.orgs.length; i++ ) {
            orgs.push( this.getOrgOf(kids[i].id) );
        }
        
        this.orgs = orgs;
    }
    
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    options: SortablejsOptions = {
        handle: '.orgs-handle',
        
        onStart: (event: any) => {
            this.dragged = this.getOrgOf(event.item.id);
        },
        
        onMove: (event: any) : boolean => {
            this.dropped = this.getOrgOf(event.related.id);
            
            // Dragged and Dropped must be siblings
            if ( this.dropped.parent_org_id != this.dragged.parent_org_id ) {
                return false;
            } else
            
            // and should not separate a child from its father            
            if ( this.hasChildren(this.dropped) ) {
                return false;
            } else
            
            return true;
        },
        
        onEnd: (event: any) => {            
            if ( this.hasChildren(this.dragged) ) {
                
                let idx = _range(this.orgs.length);
                if (event.newIndex > event.oldIndex) {
                    idx.reverse();
                }
                                
                let last = event.item;
                idx.forEach ( i => {
                    let e = event.target.children[i];
                    let o: Org = this.getOrgOf(e.id);
                    
                    while ( o.parent_org_id ) {
                        if ( o.parent_org_id == parseInt(event.item.id) ) {
                            last = event.target.insertBefore ( event.target.removeChild(e), last.nextSibling );
                            
                            if (event.newIndex > event.oldIndex) {
                                last = last.previousSibling;
                            }
                            
                            break;
                        }

                        o = this.getOrgOf(o.parent_org_id);
                    }
                });
                
                this.reorder();
            }
            
            const load = this.orgs.map ( (o,i) => {
                return { org_id: o.org_id, org_order: i }; 
            })
            
            console.log(load);            
//            this.config.reorderOrgs(load)
//                .subscribe();
        },
    };    

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    constructor( private config: ConfigService,
                 private app: AppService ) { 
        this.config.getOrgs()
            .subscribe((data) => {
                this.orgs = _sortBy(data,'org_order');
                this.repath();
            });
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.setTitle ('Configuração - Unidades Organizacionais');
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    drop (a: Org) {
        if ( a.org_id === undefined ) {
            _remove (this.orgs, i => a == i);
        } else {
            this.config.delOrg(a)
                .subscribe ( data => _remove (this.orgs, i => a == i) );
        }
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    // Promote item
    sup(a: Org) {
        // Should be next Parent's sibling or else the Parent itself
        let p = this.getParentNextSibling(a) || this.getParent(a);
        
        // make them siblings
        a.parent_org_id = p.parent_org_id;
        this.repath();
        
        // Get related elements
        const tgt = this.target.nativeElement;
        
        const kids: HTMLElement[] = Array.from(tgt.children);
        const ia = kids.findIndex((e) => parseInt(e.id) == a.org_id);
        const jn = kids.findIndex((e) => parseInt(e.id) == p.org_id);

        // move <ELEMENT> to before parent and carry all children
        let next = tgt.insertBefore ( tgt.removeChild(kids[ia]), kids[jn]);
        for ( let i=0; i<kids.length; i++ ) {
            let el = kids[i];
            let o = this.getOrgOf ( el.id );
            if ( o && o.path.includes(a.org_id,1) ) {
                next = tgt.insertBefore ( tgt.removeChild(el), next.nextSibling );
            }
        }
        
        this.reorder();
        // save a new parent
    }
    
    // Demote item
    sub(a: Org) {
        a.parent_org_id = this.getPrevSibling(a).org_id;
        this.repath();
        // save a new parent
    }
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './org-config-detail.component.html',
    styleUrls: ['./orgs-config.component.css'],
})
export class OrgConfigDetailComponent implements OnInit {
    org: Org;
    orgForm: FormGroup; 

    constructor( private route: ActivatedRoute,
                 private router: Router,
                 private config: ConfigService,
                 private app: AppService,
                 private fb: FormBuilder ) { 
    
        this.orgForm = this.fb.group ({
            'org_name':   'Nova Unidade Organizacional',
            'org_type':   'Secretaria',
            'org_sigla':  'NUO',
            'chief':      'N/A',
            'url':        'https://',
        })
    }
    
    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    ngOnInit() {
        this.app.setTitle ('Configuração - Unidades Organizacionais');
        this.route.params.subscribe(addr => {
            
            if ( addr.org_id != 'new' ) {
                this.config.getOrg(addr)
                    .subscribe((data) => {
                        this.org = data;
                        this.load();
                    });
            }
        });
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    load () : void {
        const o = _pick(this.org,['org_name','org_sigla','org_type','chief','url'])
        this.orgForm.setValue(o);
    }

    ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////
    save () : void {
        if ( this.org ) {
            this.config.putOrg(this.org, this.orgForm.value)
                .subscribe();
        } else {
            this.config.postOrg(this.orgForm.value)
                .subscribe( data => this.org = data );
        }
    }
}























////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////

//
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
//    private unflatten = function( array, parent={org_id: null}, tree=[] ){
//        const children = _filter(array, child => (child.parent_org_id == parent.org_id) );
//
//        if (children.length) {
//            if( parent.org_id == null ){
//                tree = children;   
//            } else {
//                parent['children'] = children;
//            }
//
//            _each( children, child => this.unflatten(array,child) );                    
//        }
//
//        return tree;
//    }        
