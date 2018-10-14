import { Component, OnInit } from '@angular/core';

import { AppService } from  '../../app.service';
import { ConfigService } from  '../config.service';
import { Aspect, Editable, Scale } from '../../status/status.interfaces';
import { AllowGeo, 
         DTB_Macro, DTB_Estado, 
         DTB_Meso, DTB_Micro, 
         DTB_Municipio } from '../../status/status.interfaces';

import _flatten from "lodash-es/flatten";
import _extend from "lodash-es/extend";
import _filter from "lodash-es/filter";
import _remove from "lodash-es/remove";
import _sortBy from "lodash-es/sortBy";
import _find from "lodash-es/find";
import _each from "lodash-es/each";
import _pick from "lodash-es/pick";
import _tail from "lodash-es/tail";
import _map from "lodash-es/map";


@Component({
    templateUrl: './geos-config.component.html',
    styleUrls: ['./geos-config.component.css'],
})
export class GeosConfigComponent implements OnInit {
    macros: DTB_Macro[];
    estado: DTB_Estado;
    meso:   DTB_Meso;

    status: AllowGeo[];
    
    capital: boolean = false;
    allmuns: boolean = false;
    
    constructor( private config: ConfigService,
                 private app: AppService ) { 
        
        this.config.getMacros().subscribe  ( m => this.macros=_tail(m) );
        this.config.getAllowGeo({user_id: 0}).subscribe( s => this.status = s );
    }
    
    
    ngOnInit() {
        this.app.setTitle ('Configuração - Regiões Administrativas');
    }
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    classEst(e) : string {
        if (!this.estado)
            return 'unselected';
        
        return (this.estado.ibge_id == e.ibge_id) ? 'selected' : 'unselected';
    }
    
    classMeso(m) : string {
        if ( this.capital && m == 'cap' )
            return 'selected';
        
        if ( this.allmuns && m == 'all' )  
            return 'selected';
            
        return (this.meso == m) ? 'selected' : 'unselected';
    }
    
    
    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    chooseEst(e) : void {
        this.config.getEstado(e).subscribe( s => {
            this.estado = s;
            this.estado.capital.selected = true;

            _each ( this.estado.meso, (meso) => {
                _each ( meso.munis, (mun) => {
                    _extend(mun, {selected: !! _find(this.status, _pick(mun,'ibge_id')) });
                });
            });        
        
            this.meso = undefined;
            this.capital = false;
            this.allmuns = false;
        });
    }
    
    chooseMeso(m) : void {
        this.meso = m;
        this.capital = false;
        this.allmuns = false;
    }


    private setSelection(b: boolean) : void {
        _each ( this.estado.meso, (meso) => {
            _each ( meso.munis, (mun) => {
                _extend(mun, {selected: b});
            });
        });
    }

    
    selectAll() : void {
        this.setSelection(true);        
        
        const munis =  _sortBy (_flatten( _map(this.estado.meso, 'munis')), 'toponimia');
        this.meso = { munis };
        this.capital = false;
        this.allmuns = true;
    }
    
    selectCap() : void {
        this.setSelection(false);
                
        this.meso = { munis: [this.estado.capital] };
        this.capital = true;
        this.allmuns = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    save() : void {
        const id = { user_id: 0 };
        let save;
        if ( this.capital ) {
            save = [this.estado.capital.ibge_id]
        } else {
            const muns = _flatten( _map(this.estado.meso, 'munis') );
            save = _map ( _filter(muns, {selected: true}), 'ibge_id' );
        }

        if ( save ) {
            this.config.saveAllowGeo(id, save)
                .subscribe();
        }
    }
}
