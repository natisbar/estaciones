import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapService } from '../../shared/map.service';
import { Station } from '../../shared/model/station';
import { environment } from 'src/environment/environment';
import { PopupComponent } from '../popup/popup.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DtoStation } from '../../shared/model/dtoStation';
import { HttpEvent, HttpResponse } from '@angular/common/http';

const GRADO_MENOR: number = 15;
const GRADO_MAYOR: number = 25;
const MARCADOR_AZUL: string = 'assets/image/marker_blue.png';
const MARCADOR_ROJO: string = 'assets/image/marker_red.png';
const MARCADOR_VERDE: string = 'assets/image/marker_green.png';
const MARCADOR_AZUL_SELECTED: string = 'assets/image/marker_blue_selected.png';
const MARCADOR_ROJO_SELECTED: string = 'assets/image/marker_red_selected.png';
const MARCADOR_VERDE_SELECTED: string = 'assets/image/marker_green_selected.png';

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
  private marcadorSeleccionado: Leaflet.Marker | null = null;
  private tempMarcadorSeleccionado!: number;
  private idMarcadorSeleccionado!: number;
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
    this.formActualizar = this.construirFormulario();
    this.formAgregar = this.construirFormulario();
  }

  private construirFormulario(){
    return new FormGroup({
      nombre: new FormControl("", Validators.required),
      temp: new FormControl("", [Validators.required]),
      latitud: new FormControl("", [Validators.required]),
      longitud: new FormControl("", [Validators.required]),
    });
  }

  private definirIcono(grados: number, selected: boolean): Leaflet.Icon{
    let iconUrl = "";
    let iconSize = [0, 0];
    if (!selected){
      if (grados < GRADO_MENOR){
        iconUrl = MARCADOR_AZUL;
      }
      else if (grados > GRADO_MAYOR){
        iconUrl = MARCADOR_ROJO;
      }
      else {
        iconUrl = MARCADOR_VERDE;
      }
      iconSize = [25, 25];
    }
    else {
      if (grados < GRADO_MENOR){
        iconUrl = MARCADOR_AZUL_SELECTED;
      }
      else if (grados > GRADO_MAYOR){
        iconUrl = MARCADOR_ROJO_SELECTED;
      }
      else {
        iconUrl = MARCADOR_VERDE_SELECTED;
      }
      iconSize = [55, 55];
    }

    return new Leaflet.Icon({
      iconUrl: iconUrl,
      iconSize: [iconSize[0], iconSize[1]]
    });
  }

  private iniciarMarcadores() {
    for (let index = 0; index < this.estaciones.length; index++) {
      const data = this.estaciones[index];
      const marker = this.generarMarcador(data, index, false);

      marker.addTo(this.map);

      this.map.panTo({lat: data.latitude, lng: data.longitude});
      this.markers.push(marker)
    }
    this.ajustarMapaConMarcadores();
  }

  private generarMarcador(data: any, index: number, iconoSelected: boolean) {
    const marker = Leaflet.marker({lat: data.latitude, lng: data.longitude}, { icon: this.definirIcono(data.temperature, iconoSelected) });
    marker.on('click', (event) => this.hacerClicEnMarcador(event, marker, index));
    return marker;
  }

  private ajustarMapaConMarcadores() {
    if (this.markers.length === 0) {
      this.map.setView([28.626137, 79.821603], 11);
      return;
    }
    const latLngs = this.markers.map(marker => marker.getLatLng());
    const bounds = Leaflet.latLngBounds(latLngs);
    this.map.fitBounds(bounds); //Ajusta el mapa a los límites de los marcadores
  }

  private hacerClicEnMarcador($event: any, marker: Leaflet.Marker, index: number) {
    this.cambiarIconoMarcadorSeleccionado(marker, index);
    // this.ajustarUbicacionVentana($event.containerPoint.x, $event.containerPoint.y);
    this.abrirVentanaInformativa();
    this.ocultarFormularioEnModal();
  }

  private cambiarIconoMarcadorSeleccionado(marker: Leaflet.Marker, index: number){
    this.estacionSeleccionada = this.estaciones[index];
    if (this.marcadorSeleccionado) {
      this.marcadorSeleccionado.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, false));
    }
    this.marcadorSeleccionado = marker;
    this.tempMarcadorSeleccionado = this.estacionSeleccionada.temperature;
    this.idMarcadorSeleccionado = index;
    marker.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, true));
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

  private actualizarEnMapa(datosActualizados: DtoStation){
    this.map.removeLayer(this.marcadorSeleccionado!);
    const newMarker = this.generarMarcador(datosActualizados, this.idMarcadorSeleccionado, true);
    newMarker.addTo(this.map);
    this.markers[this.idMarcadorSeleccionado] = newMarker;
    this.marcadorSeleccionado = this.markers[this.idMarcadorSeleccionado];
    this.estacionSeleccionada.latitude = datosActualizados.latitude;
    this.estacionSeleccionada.longitude = datosActualizados.longitude;
    this.estacionSeleccionada.temperature = datosActualizados.temperature;
    this.estacionSeleccionada.ubication = datosActualizados.ubication;
  }

  private eliminarEnMapa(){
    this.map.removeLayer(this.marcadorSeleccionado!);
    this.markers.splice(this.idMarcadorSeleccionado, 1);
    this.ajustarMapaConMarcadores();
  }

  private crearEnMapa(datosEstacion: DtoStation){
    const newMarker = this.generarMarcador(datosEstacion, this.markers.length, false);
    newMarker.addTo(this.map);
    this.markers.push(newMarker);
    this.ajustarMapaConMarcadores();
    this.ocultarAgregarEnModal();
    this.formAgregar.reset();
  }

  public listarEstaciones(){
     this.mapService.obtenerEstaciones(environment.endpoint).subscribe({
      next: (data: Station[]) =>{
        this.estaciones = data;
        if (this.mapListo){
          this.iniciarMarcadores();
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
          this.eliminarEnMapa();
          this.ocultarFormularioEnModal();
          this.cerrarVentanaInformativa();
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
          this.actualizarEnMapa(body);
          this.ocultarFormularioEnModal();
          this.ajustarMapaConMarcadores();
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
    console.log(this.formAgregar.valid);
    if (this.formAgregar.valid){
      let body = this.mapearFormulario(this.formAgregar);

      this.mapService.guardarEstacion(environment.endpoint, body).subscribe({
        next: (response) =>{
          this.crearEnMapa(body);
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
