
import { NgModule } from "@angular/core";
import { HomeRoutingModule } from "./home-routing.module";
import { MapComponent } from "./components/map/map.component";
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { MapService } from "./shared/map.service";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [
    MapComponent
  ],
  imports: [
    HomeRoutingModule,
    LeafletModule,
    CommonModule,
    ReactiveFormsModule
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [
    MapService
  ]
})
export class HomeModule {}
