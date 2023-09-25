import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapService } from '../../shared/map.service';
import { Station } from '../../shared/model/station';
import { environment } from 'src/environment/environment';
import { PopupComponent } from '../popup/popup.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DtoStation } from '../../shared/model/dtoStation';

const GRADO_MENOR: number = 15;
const GRADO_MAYOR: number = 25;
const MARCADOR_AZUL: string = 'assets/image/marker_blue.png';
const MARCADOR_ROJO: string = 'assets/image/marker_red.png';
const MARCADOR_VERDE: string = 'assets/image/marker_green.png';

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
  public formActualizar!: FormGroup;
  public formAgregar!: FormGroup;
  estacionSeleccionada!: Station;
  mostrarVentana: boolean = false;
  mostrarFormulario: boolean = false;
  mostrarAgregar: boolean = false;
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
    this.construirFormulario();
  }

  private construirFormulario(){
    this.formActualizar = new FormGroup({
      nombre: new FormControl("", Validators.required),
      temp: new FormControl("", [Validators.required]),
      latitud: new FormControl("", [Validators.required]),
      longitud: new FormControl("", [Validators.required]),
    });
  }

  private definirIcono(grados: number): Leaflet.Icon{
    let iconUrl = "";
    if (grados < GRADO_MENOR){
      iconUrl = MARCADOR_AZUL;
    }
    else if (grados > GRADO_MAYOR){
      iconUrl = MARCADOR_ROJO;
    }
    else {
      iconUrl = MARCADOR_VERDE;
    }

    return new Leaflet.Icon({
      iconUrl: iconUrl,
      iconSize: [25, 25]
    });
  }

  private initMarkers() {
    for (let index = 0; index < this.estaciones.length; index++) {
      const data = this.estaciones[index];
      const marker = this.generateMarker(data, index);

      marker.addTo(this.map);

      this.map.panTo({lat: data.latitude, lng: data.longitude});
      this.markers.push(marker)
    }
    this.ajustarMapaConMarcadores();
  }

  private generateMarker(data: any, index: number) {
    return Leaflet.marker({lat: data.latitude, lng: data.longitude}, { icon: this.definirIcono(data.temperature) })
      .on('click', (event) => this.markerClicked(event, index));
  }

  private ajustarMapaConMarcadores() {
    if (this.markers.length === 0) {
      this.map.setView([28.626137, 79.821603], 11);
      return;
    }
    const latLngs = this.markers.map(marker => marker.getLatLng());
    const bounds = Leaflet.latLngBounds(latLngs);
    // fitBounds para ajustar el mapa a los límites de los marcadores
    this.map.fitBounds(bounds);
  }

  private markerClicked($event: any, index: number) {
    this.estacionSeleccionada = this.estaciones[index];
    console.log(this.estacionSeleccionada);
    // this.ajustarUbicacionVentana($event.containerPoint.x, $event.containerPoint.y);
    this.abrirVentanaInformativa();
    this.ocultarFormularioEnModal();
  }

  private ajustarUbicacionVentana(x: number, y: number){
    this.ubicacion.left = x + "px";
    this.ubicacion.top = y + "px";
  }

  private llenarFormulario(data: Station){
    this.formActualizar.setValue({
      nombre: data.ubication,
      temp: data.temperature,
      latitud: data.latitude,
      longitud: data.longitude
    });
  }

  private forzarDeteccionCambios(){
    this.cdr.detectChanges();
  }

  public onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.mapListo = true;
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

  public eliminarEstacion(){
    const result = window.confirm('¿Estás seguro de eliminar esta estación?');
    if(result){
      this.mapService.eliminarEstacion(environment.endpoint, this.estacionSeleccionada.id).subscribe({
        next: (data) =>{
          this.reloadPage();
        },
        error: (error) => {
          console.log('Ocurrió un error al borrar la estación:', error);
        }
       });
    }
  }

  public actualizarEstacion(){
    if (this.formActualizar.valid){
      let body = this.mapearFormulario(this.formActualizar);
      console.log(body);
      this.mapService.actualizarEstacion(environment.endpoint, this.estacionSeleccionada.id, body).subscribe({
        next: (data) =>{
          this.reloadPage();
        },
        error: (error) => {
          console.log('Ocurrió un error al actualizar la estación:', error);
        }
      });
    }
    else{
      window.alert("Ningún campo debe estar vacio.");
    }
  }

  public crearEstacion(){

  }

  private mapearFormulario(formulario: FormGroup){
    return new DtoStation(formulario.get('latitud')?.value,
                          formulario.get('longitud')?.value,
                          formulario.get('temp')?.value,
                          formulario.get('nombre')?.value);
  }

  public iniciarActualizacion(){
    this.mostrarFormularioEnModal();
    this.llenarFormulario(this.estacionSeleccionada);
    this.forzarDeteccionCambios();
  }

  public abrirVentanaInformativa(){
    this.mostrarVentana = true;
    this.forzarDeteccionCambios();
  }

  public cerrarVentanaInformativa(){
    this.mostrarVentana = false;
    this.forzarDeteccionCambios();
  }

  public mostrarFormularioEnModal(){
    this.mostrarFormulario = true;
  }

  public ocultarFormularioEnModal(){
    this.mostrarFormulario = false;
    this.forzarDeteccionCambios();
  }

  public mostrarAgregarEnModal(){
    this.mostrarAgregar = true;
  }

  public ocultarAgregarEnModal(){
    this.mostrarAgregar = false;
    this.forzarDeteccionCambios();
  }

  public reloadPage() {
    location.reload();
  }
  // mapClicked($event: any) {
  //   console.log($event.latlng.lat, $event.latlng.lng);
  // }

}
