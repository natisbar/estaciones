import { Component, OnInit } from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapService } from '../../shared/map.service';
import { Station } from '../../shared/model/station';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{

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

  constructor(private mapService: MapService){}

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
    for (let index = 0; index < this.estaciones.length; index++) {
      const data = this.estaciones[index];
      const marker = this.generateMarker(data, index);

      marker.addTo(this.map).bindPopup(`<b>${data.latitude},  ${data.longitude}</b>`);

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
    // this.ajustarMapaConMarcadores();
  }

  mapClicked($event: any) {
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerClicked($event: any, index: number) {
    console.log("index: " + index);
    console.log($event.latlng.lat, $event.latlng.lng);
  }

  markerDragEnd($event: any, index: number) {
    console.log($event.target.getLatLng());
  }
}
