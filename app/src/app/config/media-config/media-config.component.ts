import { Component, OnInit } from '@angular/core';

import { AppService } from  '../../app.service';
import { ConfigService } from  '../config.service';
import { Twitter } from '../../media/media.interfaces'

import _pick   from "lodash-es/pick";


@Component({
    templateUrl: './media-config.component.html',
    styleUrls: ['./media-config.component.css']
})
export class MediaConfigComponent implements OnInit {
    sources: Twitter[];


    constructor( private config: ConfigService,
               private app: AppService ) { 
    
        this.config.getSources()
            .subscribe( data => { this.sources = data });
    }

    ngOnInit() {
        this.app.setTitle ('Configuração - Twitter Sources');
    }
    
    save (s: Twitter) : void {
        console.log(s);
        this.config.putSource(s,s).subscribe();
    }
}
