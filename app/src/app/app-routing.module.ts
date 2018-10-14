import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// auth
import { AuthGuard }         from './auth/auth.guard';
import { CallbackComponent } from './auth/callback/callback.component';
import { ProfileComponent  } from './auth/profile/profile.component';

// config
import { ConfigComponent        } from './config/config.component';
import { AspectsConfigComponent } from './config/aspects-config/aspects-config.component';
import { EventsConfigComponent  } from './config/events-config/events-config.component';
import { MediaConfigComponent   } from './config/media-config/media-config.component';
import { GeosConfigComponent    } from './config/geos-config/geos-config.component';
import { OrgsConfigComponent,
       OrgConfigDetailComponent } from './config/orgs-config/orgs-config.component';

// events
import { EventDetailComponent }   from './event/event-detail/event-detail.component';
import { EventListComponent }     from './event/event-list/event-list.component';

// form
import { FormEditComponent } from './form/form-edit/form-edit.component';
import { FormFillComponent } from './form/form-fill/form-fill.component';
import { FormViewComponent } from './form/form-view/form-view.component';
import { FormListComponent } from './form/form-list/form-list.component';

// maps
import { MapsComponent   } from './maps/maps.component';
import { MapyxComponent  } from './maps/mapyx/mapyx.component';

// media
import { TimeLineComponent } from './media/time-line/time-line.component';
import { MobileComponent   } from './mobile/mobile/mobile.component';


// static
import { AboutComponent    } from './static/about/about.component';
import { FrontPageComponent} from './static/front-page/front-page.component';
import { InsitComponent    } from './static/insit/insit.component';

// status
import { OrgStatusComponent  } from './status/org-status/org-status.component';
import { OrgDetailComponent  } from './status/org-detail/org-detail.component';
import { GeoStatusComponent  } from './status/geo-status/geo-status.component';
import { GeoDetailComponent  } from './status/geo-detail/geo-detail.component';
import { SitStatusComponent  } from './status/sit-status/sit-status.component';





const routes: Routes = [
    {
        path: 'map',
        component: MapsComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org',
        component: OrgStatusComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org/:org_id',
        component: OrgDetailComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org/:org_id/:aspect_id',
        component: FormListComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org/:org_id/:aspect_id/edit',
        component: FormEditComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org/:org_id/:aspect_id/fill',
        component: FormFillComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'org/:org_id/:aspect_id/:fill_id',
        component: FormViewComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'geo',
        component: GeoStatusComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'geo/:geo_id',
        component: GeoDetailComponent,
//        canActivate: [AuthGuard]
    },
    {
        path: 'sit/:aspect_id',
        component: SitStatusComponent,
//        canActivate: [AuthGuard]
    },
    
    
    
    {
        path: 'event',
        component: EventListComponent,
//        canActivate: [AuthGuard]
    },
    
    
    {
        path: 'event/:event_id',
        component: EventDetailComponent,
//        canActivate: [AuthGuard]
    },
    
    
    

    {
        path: 'mapyx',
        component: MapyxComponent
//        canActivate: [AuthGuard]
    },

    {
        path: 'media',
        component: TimeLineComponent
//        canActivate: [AuthGuard]
    },

    {
        path: 'mobile',
        component: MobileComponent
//        canActivate: [AuthGuard]
    },

    {
        path: 'callback',
        component: CallbackComponent
    },
    {
        path: 'config',
        component: ConfigComponent,
        children: [
            {
                path: 'aspects',
                component: AspectsConfigComponent
            },
            {
                path: 'events',
                component: EventsConfigComponent
            },
            {
                path: 'orgs',
                component: OrgsConfigComponent
            },
            {
                path: 'orgs/:org_id',
                component: OrgConfigDetailComponent
            },
            {
                path: 'geos',
                component: GeosConfigComponent
            },
            {
                path: 'media',
                component: MediaConfigComponent
            },
        ]
    },
//    {
//        path: 'insit',
//        component: FrontPageComponent
//    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'about',
        component: AboutComponent
    },
    
    {
        path: 'insit',
        component: InsitComponent
    },
    
    { path: '', component: FrontPageComponent, pathMatch: 'full' }, 
    { path: '**', redirectTo: '/' },    
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }