
import { NgModule } from "@angular/core";
import { HomeRoutingModule } from "./home-routing.module";
import { MapComponent } from "./components/map/map.component";
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapService } from "./shared/map.service";
import { PopupComponent } from './components/popup/popup.component';
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [
    MapComponent,
    PopupComponent
  ],
  imports: [
    HomeRoutingModule,
    LeafletModule,
    CommonModule
  ],
  exports: [
    CommonModule
  ],
  providers: [
    MapService
  ]
})
export class HomeModule {}
