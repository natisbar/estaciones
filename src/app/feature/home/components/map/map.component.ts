import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapService } from '../../shared/map.service';
import { Station } from '../../shared/model/station';
import { environment } from 'src/environment/environment';
import { PopupComponent } from '../popup/popup.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{
  @ViewChild('map') mapElement!: any;
  @ViewChild('popupComponent') popupComponent!: PopupComponent;

  ubicacion = {
    left: "0",
    top: "0"
  }
  estacionSeleccionada!: Station;
  mostrarVentana: boolean = false;
  public estaciones: Station[] = [];
  map!: Leaflet.Map;
  markers: Leaflet.Marker[] = [];
  mapListo: boolean = false;
  options = {
    layers: [
      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      })
    ],
    zoom: 16,
    // center: { lat: 28.626137, lng: 79.821603 }
  }

  constructor(private mapService: MapService, private cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    this.listarEstaciones();
    this.definirIconos();
  }

  private definirIconos(){
    Leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'assets/marker-icon-2x.png',
      iconUrl: 'assets/marker-icon.png',
      shadowUrl: 'assets/marker-shadow.png'
    });
  }


  public listarEstaciones(){
     this.mapService.obtenerEstaciones(environment.endpoint).subscribe({
      next: (data: Station[]) =>{
        this.estaciones = data;
        console.log(this.estaciones);
        if (this.mapListo){
          this.initMarkers();
        }
      },
      error: (error) => {
        console.log('Ocurrió un error al obtener las estaciones:', error);
      }
     });
  }

  ajustarMapaConMarcadores() {
    if (this.markers.length === 0) {
      // No hay marcadores para ajustar, puedes establecer el centro manualmente si es necesario
      this.map.setView([28.626137, 79.821603], 11);
      return;
    }

    const latLngs = this.markers.map(marker => marker.getLatLng());
    const bounds = Leaflet.latLngBounds(latLngs);

    // Utiliza fitBounds para ajustar el mapa a los límites de los marcadores
    this.map.fitBounds(bounds);
  }


  initMarkers() {
    console.log("initMarkers");
    for (let index = 0; index < this.estaciones.length; index++) {
      const data = this.estaciones[index];
      const marker = this.generateMarker(data, index);

      marker.addTo(this.map);

      this.map.panTo({lat: data.latitude, lng: data.longitude});
      this.markers.push(marker)
    }
    this.ajustarMapaConMarcadores();
  }

  generateMarker(data: any, index: number) {
    return Leaflet.marker({lat: data.latitude, lng: data.longitude}, { draggable: data.draggable })
      .on('click', (event) => this.markerClicked(event, index))
      .on('dragend', (event) => this.markerDragEnd(event, index));
  }

  onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.mapListo = true;
  }

  // mapClicked($event: any) {
  //   console.log($event.latlng.lat, $event.latlng.lng);
  // }

  markerClicked($event: any, index: number) {
    console.log("index: " + index);
    console.log($event.latlng.lat, $event.latlng.lng);


    this.estacionSeleccionada = this.estaciones[index];
    console.log(this.estacionSeleccionada);

    // this.ajustarUbicacionVentana($event.containerPoint.x, $event.containerPoint.y);
    this.abrirVentanaInformativa();
    this.cdr.detectChanges(); // Forzar la detección de cambios

    // popup!.style.left = $event.containerPoint.x + 'px';
    // popup!.style.top = $event.containerPoint.y + 'px';

  }

  ajustarUbicacionVentana(x: number, y: number){
    this.ubicacion.left = x + "px";
    this.ubicacion.top = y + "px";
    console.log(this.ubicacion);
  }

  markerDragEnd($event: any, index: number) {
    console.log($event.target.getLatLng());
  }

  abrirVentanaInformativa(){
    this.mostrarVentana = true;
    console.log(this.mostrarVentana);
  }

  cerrarVentanaInformativa(){
    this.mostrarVentana = false;
    this.cdr.detectChanges(); // Forzar la detección de cambios
  }


}
