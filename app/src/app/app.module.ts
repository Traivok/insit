import { NgModule }      from '@angular/core';
import { BrowserModule }            from '@angular/platform-browser';
import { BrowserAnimationsModule }  from '@angular/platform-browser/animations';
import { ReactiveFormsModule,
         FormsModule }              from '@angular/forms';
import { HttpClientModule }         from '@angular/common/http';
import { JwtModule }                from '@auth0/angular-jwt';

import { FlexLayoutModule }         from "@angular/flex-layout";
import { MatButtonModule, 
         MatButtonToggleModule, 
         MatCardModule,
         MatCheckboxModule,
         MatChipsModule,
         MatDatepickerModule,
         MatDialogModule, 
         MatExpansionModule,
         MatGridListModule,
         MatIconModule,
         MatInputModule,
         MatListModule,
         MatMenuModule,
         MatNativeDateModule,
         MatPaginatorModule,
         MatProgressBarModule,
         MatProgressSpinnerModule,
         MatRippleModule,
         MatSelectModule,
         MatSidenavModule,
         MatSlideToggleModule,
         MatSliderModule,
         MatSortModule,
         MatStepperModule,
         MatTableModule,
         MatTabsModule,
         MatToolbarModule,
         MatTooltipModule } from '@angular/material';

import { MomentModule }     from 'ngx-moment';
import { SortablejsModule } from 'angular-sortablejs';
import { NgPipesModule }    from 'ngx-pipes';
import { ColorPickerModule} from 'ngx-color-picker';
import { NgDragDropModule } from 'ng-drag-drop';

// App 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent }     from './app.component';
import { AppService }       from './app.service';


// auth
import { AuthGuard }         from './auth/auth.guard';
import { AuthService }       from './auth/auth.service';
import { AuthDirective }     from './auth/auth.directive';
import { CallbackComponent } from './auth/callback/callback.component';
import { ProfileComponent  } from './auth/profile/profile.component';

// config
import { ConfigService          } from './config/config.service';
import { ConfigComponent        } from './config/config.component';
import { AspectsConfigComponent } from './config/aspects-config/aspects-config.component';
import { EventsConfigComponent  } from './config/events-config/events-config.component';
import { GeosConfigComponent    } from './config/geos-config/geos-config.component';
import { OrgsConfigComponent,
         OrgConfigDetailComponent } from './config/orgs-config/orgs-config.component';

// form
import { FormService       } from './form/form.service';
import { FormFillComponent,
         ShowInputDlg, 
         ShowTextDlg       } from './form/form-fill/form-fill.component';
import { FormEditComponent } from './form/form-edit/form-edit.component';
import { FormViewComponent } from './form/form-view/form-view.component';
import { FormListComponent } from './form/form-list/form-list.component';

// maps
import { MapsComponent, 
         MapDialog       } from './maps/maps.component';
import { MapyxComponent  } from './maps/mapyx/mapyx.component';

// static
import { AboutComponent     }  from './static/about/about.component';
import { FrontPageComponent }  from './static/front-page/front-page.component';

// status
import { OrgStatusComponent  } from './status/org-status/org-status.component';
import { OrgDetailComponent  } from './status/org-detail/org-detail.component';
import { GeoStatusComponent  } from './status/geo-status/geo-status.component';
import { GeoDetailComponent  } from './status/geo-detail/geo-detail.component';
import { SitStatusComponent  } from './status/sit-status/sit-status.component';

import { StatusService   }  from './status/status.service';
import { StatusComponent }  from './status/status/status.component';
import { CountsComponent }  from './status/counts/counts.component';
import { IconChooserDlg  }  from './config/icon-chooser/icon-chooser.dialog';

import { MobileComponent,
         ShowMediaDlg }     from './mobile/mobile/mobile.component';
import { MobileService }    from './mobile/mobile.service';

import { EventDetailComponent }   from './event/event-detail/event-detail.component';
import { EventListComponent } from './event/event-list/event-list.component';
import { ShowMediaEventDlg }   from './event/show-media/show-media.dialog';

import { TimeLineService }  from './media/time-line/time-line.service';
import { TimeLineComponent, 
         TwitterLineComponent } from './media/time-line/time-line.component';
import { MediaConfigComponent } from './config/media-config/media-config.component';
import { InsitComponent } from './static/insit/insit.component';
import { LatLonPipe } from './pipes/lat-lon.pipe';


export function tokenGetter() { 
    return localStorage.getItem('access_token');
}


@NgModule({
  declarations: [
    AuthDirective,
    AppComponent,
    CallbackComponent,
    AboutComponent,
    ConfigComponent,
    ProfileComponent,
    GeoStatusComponent,
    SitStatusComponent,
    OrgStatusComponent,
    GeoDetailComponent,
    OrgDetailComponent,
    StatusComponent,
    CountsComponent,
    MapsComponent,
    MapDialog,
    MapyxComponent,
    FrontPageComponent,
    FormEditComponent,
    FormListComponent,
    FormViewComponent,
    FormFillComponent,
    ShowInputDlg,
    ShowTextDlg,
    AspectsConfigComponent,
    EventsConfigComponent,
    GeosConfigComponent,
    OrgsConfigComponent,
    OrgConfigDetailComponent,
    IconChooserDlg,
    TimeLineComponent,
    TwitterLineComponent,      
    MobileComponent, 
    ShowMediaDlg, 
    ShowMediaEventDlg,
    MediaConfigComponent, 
    EventDetailComponent, EventListComponent, InsitComponent, LatLonPipe,
 ],
  imports: [ 
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    FlexLayoutModule,
    MatButtonModule, 
    MatButtonToggleModule, 
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,  
    MatDialogModule, 
    MatExpansionModule,
    MatGridListModule,  
    MatInputModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,  
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MomentModule,
    MatNativeDateModule, 
    MatRippleModule,
    NgPipesModule,
    ColorPickerModule,
    NgDragDropModule.forRoot(),  
    SortablejsModule.forRoot({ animation: 150 }),
    JwtModule.forRoot({
        config: {
                tokenGetter: tokenGetter,
                whitelistedDomains: ['localhost:3000']
                }
    })
      
  ],
  entryComponents: [
      MapDialog,
      ShowTextDlg,
      ShowInputDlg,
      ShowMediaDlg,
      ShowMediaEventDlg,
      IconChooserDlg
  ],    
  providers: [
      AppService,
      FormService,
      ConfigService,
      StatusService,
      MobileService,
      TimeLineService,
      AuthService,
      AuthGuard,
//      { provide: LOCALE_ID, useValue: 'pt' } 
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }