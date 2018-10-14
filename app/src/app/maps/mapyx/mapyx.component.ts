import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
    templateUrl: './mapyx.component.html',
    styleUrls: ['./mapyx.component.css'],
})
export class MapyxComponent implements OnInit {

    dtb: any[];
    
    
    constructor( private http: HttpClient ) { 
    
    http.get<any[]>('https://localhost:3000/api/1.0/mapyx')
        .subscribe( (data) => this.dtb = data )
    
    }

    ngOnInit() {
    
    
    }

}
