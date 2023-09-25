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
      iconSize = [60, 60];
    }
    console.log(iconUrl)
    return new Leaflet.Icon({
      iconUrl: iconUrl,
      iconSize: [iconSize[0], iconSize[1]]
    });
  }

  private iniciarMarcadores() {
    for (let index = 0; index < this.estaciones.length; index++) {
      const data = this.estaciones[index];
      const marker = this.generarMarcador(data, index);

      marker.addTo(this.map);

      this.map.panTo({lat: data.latitude, lng: data.longitude});
      this.markers.push(marker)
    }
    this.ajustarMapaConMarcadores();
  }

  private generarMarcador(data: any, index: number) {
    const marker = Leaflet.marker({lat: data.latitude, lng: data.longitude}, { icon: this.definirIcono(data.temperature, false) });
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
    // fitBounds para ajustar el mapa a los límites de los marcadores
    this.map.fitBounds(bounds);
  }

  private hacerClicEnMarcador($event: any, marker: Leaflet.Marker, index: number) {
    this.estacionSeleccionada = this.estaciones[index];
    console.log(this.estacionSeleccionada);

    if (this.marcadorSeleccionado) {
      this.marcadorSeleccionado.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, false));
    }

    // Establece el nuevo marcador como el marcador seleccionado.
    this.marcadorSeleccionado = marker;
    this.tempMarcadorSeleccionado = this.estacionSeleccionada.temperature;

    // Cambia el icono del marcador al icono personalizado.
    marker.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, true));


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
    console.log(this.formAgregar.valid);
    if (this.formAgregar.valid){
      let body = this.mapearFormulario(this.formAgregar);
      console.log(body);
      this.mapService.guardarEstacion(environment.endpoint, body).subscribe({
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
