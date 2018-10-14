import { AfterViewInit, 
         ElementRef, 
         Component, 
         Input      } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppService      } from '../../app.service';
import { TimeLineService } from './time-line.service';

import { Twitter } from '../../media/media.interfaces'

import _map from "lodash-es/map";
import _remove from "lodash-es/remove";

@Component({
    templateUrl: './time-line.component.html',
    styleUrls: ['./time-line.component.css'],
})
export class TimeLineComponent {
    sources: Twitter[];
    
    constructor( public http: HttpClient,
                 private app: AppService ) {
        
        this.http.get<Twitter[]> ( this.app.uri('/models/twitter') )
            .subscribe ( data => this.sources = data );
    }
    
    drop(src) : void {
        _remove (this.sources, i => src == i);
        this.sources.push({twitter_id: undefined, screenName: undefined, sourceType: 'profile' });
    }
    
}

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
@Component({
    selector: 'twitter-line',
    template: '',
})
export class TwitterLineComponent implements AfterViewInit { //  OnInit,
    @Input() dataSrc: object;
    @Input() opts: object;

    constructor ( private element: ElementRef,
                  private tls : TimeLineService ) { }

    ngAfterViewInit() {
        //MAKE SURE TWITTER WIDGET SCRIPT IS LOADED IN HEAD...
        this.tls
            .LoadScript()
            .subscribe(
                //SUCCESS, WE HAVE TWITTER WIDGETS JS FILE LOADED...
                twttr => {
                    let nativeElement = this.element.nativeElement;

                    window['twttr']
                        .widgets
                        .createTimeline(this.dataSrc, nativeElement, this.opts)
                        .then( () => {} )
                        .catch( () => {} )
                },

                //ERROR
                err => { console.log('****  ERROR LOADING TWITTER WIDGET', err); },

                //COMPLETE
                () => {} );
    }

    private onTwitterLoaded(twttr) {
        console.log('TWITTER LOADED YO', twttr);
    }
}