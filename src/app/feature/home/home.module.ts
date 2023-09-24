
import { NgModule } from "@angular/core";
import { HomeRoutingModule } from "./home-routing.module";
import { MapComponent } from "./components/map/map.component";
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapService } from "./shared/map.service";
import { PopupComponent } from './components/popup/popup.component';

@NgModule({
  declarations: [
    MapComponent,
    PopupComponent,
  ],
  imports: [
    HomeRoutingModule,
    LeafletModule,
  ],
  exports: [
  ],
  providers: [
    MapService
  ]
})
export class HomeModule {}
