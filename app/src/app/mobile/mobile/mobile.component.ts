import { Component,
         Inject,
         ViewChild, 
         ViewChildren, 
         AfterViewInit, 
         QueryList }        from '@angular/core';

import { MatDialog, 
         MatDialogRef, 
         MAT_DIALOG_DATA }  from '@angular/material';

import { AppService }       from '../../app.service';
import { MobileService }    from '../mobile.service';

import { Geo, Event, 
         EventGeo, 
         EventStatus, 
         EventType,
         Severity }         from  '../../status/status.interfaces';

import OlMap    from 'ol/map';
import OlView   from 'ol/view';
import OlProj   from 'ol/proj';
import OlCollection from 'ol/collection';

import OlLayerGroup from 'ol/layer/group';
import OlTileLayer  from 'ol/layer/tile';
import OlVectorLayer  from 'ol/layer/vector';
import OlSourceOSM  from 'ol/source/osm';
import OlSourceVector  from 'ol/source/vector';
import OlFeature  from 'ol/feature';
import OlPoint  from 'ol/geom/point';
import OlStyle  from 'ol/style/style';
import OlIcon  from 'ol/style/icon';

import OlOverlay        from 'ol/overlay';
import OlInteraction    from 'ol/interaction';
import OlInteractionModify    from 'ol/interaction/modify';
import OlInteractionSelect    from 'ol/interaction/select';
import OlInteractionDragRotateAndZoom from 'ol/interaction/dragrotateandzoom';

import _remove from "lodash-es/remove";
import _extend from "lodash-es/extend";
import _sortBy from "lodash-es/sortBy";
import _pick   from "lodash-es/pick";
import _each   from "lodash-es/each";

declare var MediaRecorder: any;

interface MediaStore {
    created_at:     Date;
    buffer:         Blob;
    sent:           boolean;
};

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
@Component({
    template:  `<mat-dialog-content>
                    <div #mediaElement></div>
                </mat-dialog-content>
                <mat-dialog-actions fxFlexAlign="end" fxLayout="row" fxLayoutAlign="end">
                    <button mat-button [matDialogClose]="null">Fechar</button>
                </mat-dialog-actions>`,
})
export class ShowMediaDlg {
    @ViewChild('mediaElement') 
    media: any;
    elem:  any;
    type:  string;
    
    constructor( public dialogRef: MatDialogRef<ShowMediaDlg>,
                  @Inject(MAT_DIALOG_DATA) public data: MediaStore) { 
        
        this.type = this.data.buffer.type.split('/')[0];
    }

    ngOnInit() {        
        if ( this.type == 'image') {
            this.elem = new Image(960,720);
        } else if ( this.type == 'video' ) {
            this.elem = document.createElement('video');
            this.elem.autoplay = true;
            this.elem.controls = true;
        } else if  ( this.type == 'audio' ) {
            this.elem = document.createElement('audio');
            this.elem.autoplay = true;
            this.elem.controls = true;
        }
        
        this.elem.src = window.URL.createObjectURL(this.data.buffer);
        this.media.nativeElement.appendChild(this.elem);
    }
    
    onNoClick(): void {
        window.URL.revokeObjectURL(this.elem)
        this.dialogRef.close(); 
    }
}

/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////
@Component({
    templateUrl: './mobile.component.html',
    styleUrls: ['./mobile.component.css'],
})
export class MobileComponent implements AfterViewInit {
    @ViewChildren('videoElement') 
    videoElement: QueryList<any>;  
    video: HTMLVideoElement;

    @ViewChildren('audioElement') 
    audioElement: QueryList<any>;  
    audio: HTMLVideoElement;

    @ViewChildren('pictureElement')
    pictureElement: QueryList<any>;    
    picture: HTMLCanvasElement;
    
    @ViewChildren('mapElement')
    mapElement: QueryList<any>;    
    
    //////////////////////////////////
    //////////////////////////////////
    mediaRecorder:  any;
    
    media:      MediaStore[] = [];
    buffer:     Blob[] = [];
    comment:    string;

    bRecording: boolean = false;
    mode:       string;
    
    
    ///////////////////////////////////////////////////////////////////
    // OpenLayers
    map:        OlMap;
    OSM:        OlTileLayer;
    center:     OlView;
    pin:        OlFeature;
    marker:     OlVectorLayer;
    source:     OlSourceVector;
    
    bbox:       number[] = [-4875408, -2642046, -4797763, -2601332];
    
    ///////////////////////////////////////////////////////////////////
    // Component Data
    geo:        Geo;
    geos:       Geo[];
    
    eventtype:  EventType;
    eventtypes: EventType[];
    
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    constructor( private dialog: MatDialog, 
                 private mobile: MobileService,
                 private app:    AppService ) {
    
        this.app.setTitle('Interface Mobile');        
    
        this.mobile.getEventTypes().subscribe(data => {
            this.eventtypes = _sortBy(data,'eventtype_order');
        });     
    
        this.mobile.getGeo().subscribe(data => { 
            this.geos = data;
        });

        this.OSM = new OlTileLayer ({ type: 'base', title: 'OpenStreetMaps', source: new OlSourceOSM() });
        this.center = new OlView({  projection: 'EPSG:3857',
                                    extent: this.bbox,
                                    center: [-4835000, -2624000],
                                      zoom: 10,
                                   maxZoom: 18,
                                   minZoom: 10 });    

        this.pin  = new OlFeature({
            geometry: new OlPoint([-4835000, -2624000]),
        });

        
        const style = new OlStyle({
                image: new OlIcon({
                    anchor: [0.5, 0],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    opacity: 0.75,
                    src: 'assets/pin.png'
                })
        });
        
        
        this.source = new OlSourceVector({ features: [this.pin] })
        
        this.marker = new OlVectorLayer({
            source: this.source,
            style: style
        });    
        
        
        const select = new OlInteractionSelect({ features: new OlCollection([this.pin]), style: style });
        const drag = new OlInteractionModify({ features: new OlCollection([this.pin]), style: style });
        
        this.map = new OlMap({view: this.center,
                            layers: [ new OlLayerGroup({ title: 'Base Layer', layers: [this.OSM, this.marker] }) ],
                      interactions: OlInteraction.defaults().extend([ new OlInteractionDragRotateAndZoom() ]),
                });
        
        this.map.addInteraction(select);
        this.map.addInteraction(drag);
        
        this.pin.on ('change', function(data){
            console.log(data);
        })
    }
    
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    ngAfterViewInit() {
        this.videoElement.changes
            .subscribe((c: QueryList <any>) => { 
            if ( c.length > 0)
                this.video = c.first.nativeElement 
            });

        this.pictureElement.changes
            .subscribe((c: QueryList <any>) => { 
            if ( c.length > 0)
                this.picture = c.first.nativeElement;
            });

        this.mapElement.changes
            .subscribe((c: QueryList <any>) => { 
            if ( c.length > 0)
                this.map.setTarget(c.first.nativeElement);
            });
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    geoChange() : void  {
        const goTo = (pos) => {
            console.log(pos);
        };
        
        const error = (err) => {
            console.log(err);
        };
        
        
        if ( !this.geo ) {
            navigator.geolocation.getCurrentPosition (goTo, error);
        }
        
        const bbox = this.geo ? this.geo.bbox : this.bbox;
        this.center.fit(bbox, {duration: 1500});
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    initPic () : void {
        this.mode = 'picture';
        this.bRecording = true;

        navigator.mediaDevices
            .getUserMedia({ video: true, audio: false })
            .then(stream => {            
                this.video.srcObject = stream;
                this.video.play();
            })
            .catch(err => {
                console.log(err);
                this.done();                
            });
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////////////////////////////////////////////////////////
    initCam (v) : void {
        this.mode = v ? 'video' : 'audio';
        this.bRecording = true;

        const mimeType = v ? 'video/webm' : 'audio/webm';
        const that = this;
        navigator.mediaDevices
            .getUserMedia({ video: v, audio: true })
            .then(stream => {
                this.video.srcObject = stream;
                
                this.mediaRecorder = new MediaRecorder(stream, {mimeType: mimeType+'; codecs=opus'});
                this.mediaRecorder.start(5000);
                this.mediaRecorder.ondataavailable = e => that.buffer.push(e.data);
                this.mediaRecorder.onstop = function(e) {
                    that.media.push ({ buffer: new Blob(that.buffer, { type: mimeType }), 
                                   created_at: new Date(), sent: false });
                    };
            })
            .catch(err => {
                console.log(err);
                this.done();
            });
    }

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    take() : void {
        if ( this.mode == 'picture' ) {
            this.picture
                .getContext('2d')
                .drawImage( this.video, 0, 0, this.picture.width, this.picture.height );

            this.picture
                .toBlob( b => this.media.push ({ buffer: b, created_at: new Date(), sent: false }) );
            
        } else {
            this.mediaRecorder.stop();        
        }

        this.done();
    }

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    done() : void {
        this.mode = undefined;
        this.bRecording = false;
    
        if ( this.mediaRecorder ) {
            this.mediaRecorder
                .stream
                .getVideoTracks()
                .forEach(track => track.stop())

            this.mediaRecorder = undefined;
            this.buffer = [];
        }
    }

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    show(m : MediaStore) {
        this.dialog
            .open(ShowMediaDlg, {data: m})
            .afterClosed()
            .subscribe();
    }
    
    drop(m : MediaStore) {
        _remove (this.media, i => m == i);
    }

    ///////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////
    post () : void {
        const c = this.map.getView().getCenter();

        const load = { lon: c[0], lat: c[1],
               description: this.comment,
//                    geo_id: this.geo.geo_id,
              eventtype_id: this.eventtype.eventtype_id };
        
        this.mobile.postEvent(load)
            .subscribe((event) => {
                const event_id = _pick(event,'event_id');
                _each (this.media, (m) => {
                    const form = new FormData();
                    form.append('created_at',   m.created_at.toDateString() );
                    form.append('attach',       m.buffer);

                    this.mobile.sendAttach(form)
                        .subscribe((store) => {
                            const id = _extend (_pick(store,'store_id'), event_id);
                        
                            this.mobile.makeAttach(id)
                                .subscribe( () => m.sent = true );
                        });
                });
            });
    }
}