import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import * as Leaflet from 'leaflet';
import { MapService } from '../../shared/map.service';
import { Station } from '../../shared/model/station';
import { environment } from 'src/environment/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DtoStation } from '../../shared/model/dtoStation';
import { ModalNotificaciones } from 'src/app/core/services/modal.service';
import { SweetAlertIcon } from 'sweetalert2';
import { numeroValidatorConRango, regularCharacterValidator } from 'src/app/shared/form.validator';

const GRADO_MENOR: number = 15;
const GRADO_MAYOR: number = 25;
const MIN_TEMPERATURA: number = -100;
const MAX_TEMPERATURA: number = 100;
const MIN_LONGITUD: number = -180;
const MAX_LONGITUD: number = 180;
const MIN_LATITUD: number = -90;
const MAX_LATITUD: number = 90;
const MARCADOR_AZUL: string = 'assets/image/marker_blue.png';
const MARCADOR_ROJO: string = 'assets/image/marker_red.png';
const MARCADOR_VERDE: string = 'assets/image/marker_green.png';
const MARCADOR_AZUL_SELECTED: string = 'assets/image/marker_blue_selected.png';
const MARCADOR_ROJO_SELECTED: string = 'assets/image/marker_red_selected.png';
const MARCADOR_VERDE_SELECTED: string = 'assets/image/marker_green_selected.png';
const SATISFACTORIO_ICON: SweetAlertIcon = 'success';
const ERROR_ICON: SweetAlertIcon = 'error';
const INFORMACION_INCORRECTA: string = 'Hay campos incorrectos. Por favor ajustelos:';
const SOLICITUD_EXITOSA: string = 'Tu solicitud ha sido realizada exitosamente.';
const SOLICITUD_ERROR: string = 'Se ha presentado inconvenientes con la solicitud. Intentalo nuevamente.';
const MENSAJE_CONFIRM: string = '¿Estás seguro de eliminar esta estación?';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit{

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
  }

  constructor(private mapService: MapService,
              private cdr: ChangeDetectorRef,
              private modalNotificaciones: ModalNotificaciones){}

  ngOnInit(): void {
    this.listarEstaciones(true);
    this.formActualizar = this.construirFormulario();
    this.formAgregar = this.construirFormulario();
  }

  private validarMovimientoMapa(){
    this.map.on('move', (event) => {
      this.cerrarVentanaInformativa();
    });
  }

  private construirFormulario(){
    return new FormGroup({
      nombre: new FormControl("", [Validators.required, regularCharacterValidator()]),
      temp: new FormControl("", [Validators.required, numeroValidatorConRango(MIN_TEMPERATURA, MAX_TEMPERATURA)]),
      latitud: new FormControl("", [Validators.required, numeroValidatorConRango(MIN_LATITUD, MAX_LATITUD)]),
      longitud: new FormControl("", [Validators.required, numeroValidatorConRango(MIN_LONGITUD, MAX_LONGITUD)]),
    });
  }

  private obtenerNombreField(formulario: FormGroup) { return formulario.get('nombre'); }
  private obtenerTemperaturaField(formulario: FormGroup) { return formulario.get('temp'); }
  private obtenerLatitudField(formulario: FormGroup) { return formulario.get('latitud'); }
  private obtenerLongitudField(formulario: FormGroup) { return formulario.get('longitud'); }

  private obtenerErrores(form: FormGroup){
    return `${(this.obtenerNombreField(form)!.errors?.['required']) ? " -nombre es requerido" : ""}
    ${(this.obtenerTemperaturaField(form)!.errors?.['required']) ? " -temperatura es requerida" : ""}
    ${(this.obtenerLatitudField(form)!.errors?.['required']) ? " -latitud es requerida" : ""}
    ${(this.obtenerLongitudField(form)!.errors?.['required']) ? "-longitud es requerida" : ""}
    ${(this.obtenerTemperaturaField(form)!.errors?.['numeroPattern']) ? " -temperatura debe ser un numero" : ""}
    ${(this.obtenerLatitudField(form)!.errors?.['numeroPattern']) ? " -latitud debe ser un numero" : ""}
    ${(this.obtenerLongitudField(form)!.errors?.['numeroPattern']) ? " -longitud debe ser un numero" : ""}
    ${(this.obtenerTemperaturaField(form)!.errors?.['rangoInvalido']) ? " -latitud fuera de rango (" + MIN_TEMPERATURA + " a " + MAX_TEMPERATURA + ")" : ""}
    ${(this.obtenerLatitudField(form)!.errors?.['rangoInvalido']) ? " -latitud fuera de rango (" + MIN_LATITUD + " a " + MAX_LATITUD + ")" : ""}
    ${(this.obtenerLongitudField(form)!.errors?.['rangoInvalido']) ? " -latitud fuera de rango (" + MIN_LONGITUD + " a " + MAX_LONGITUD + ")" : ""}`;
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
    if (this.markers.length > 0){
      this.markers.forEach(marker => {
        this.map.removeLayer(marker);
      });
      this.markers = [];
    }

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
    this.abrirVentanaInformativa();
    this.ajustarUbicacionVentana($event.containerPoint.x, $event.containerPoint.y);
  }

  private cambiarIconoMarcadorSeleccionado(marker: Leaflet.Marker, index: number){
    this.estacionSeleccionada = this.estaciones[index];
    if (this.marcadorSeleccionado && this.marcadorSeleccionado != null) {
      this.marcadorSeleccionado.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, false));
    }
    this.marcadorSeleccionado = marker;
    this.tempMarcadorSeleccionado = this.estacionSeleccionada.temperature;
    this.idMarcadorSeleccionado = index;
    marker.setIcon(this.definirIcono(this.tempMarcadorSeleccionado, true));
  }

  private ajustarUbicacionVentana(x: number, y: number){
    const customPopup = document.querySelector('#modalInformacion') as HTMLElement;
    const popupWidth = customPopup.offsetWidth;
    const popupHeight = customPopup.offsetHeight;

    const marginX = 10;
    const marginY = 30;

    const left = x - popupWidth / 2;
    const top = y - popupHeight - marginY;

    this.ubicacion.left = x + "px";
    this.ubicacion.top = y + "px";

    if (left < 0) {
      customPopup.style.left = marginX + 'px';
    } else if (left + popupWidth > this.map.getSize().x) {
      customPopup.style.left = (this.map.getSize().x - popupWidth - marginX) + 'px';
    } else {
      customPopup.style.left = left + 'px';
    }

    if (top < 0) {
      customPopup.style.top = marginY + 'px';
    } else {
      customPopup.style.top = top + 'px';
    }
  }

  private llenarFormulario(data: Station){
    this.formActualizar.setValue({
      nombre: data.ubication,
      temp: data.temperature,
      latitud: data.latitude,
      longitud: data.longitude
    });
  }

  private mapearFormulario(formulario: FormGroup){
    return new DtoStation(formulario.get('latitud')?.value,
                          formulario.get('longitud')?.value,
                          formulario.get('temp')?.value,
                          formulario.get('nombre')?.value);
  }

  private forzarDeteccionCambios(){
    this.cdr.detectChanges();
  }

  private actualizarEnMapa(datosActualizados: DtoStation){
    this.listarEstaciones(false);
    this.map.removeLayer(this.marcadorSeleccionado!);
    const newMarker = this.generarMarcador(datosActualizados, this.idMarcadorSeleccionado, true);
    newMarker.addTo(this.map);
    this.markers[this.idMarcadorSeleccionado] = newMarker;
    this.marcadorSeleccionado = this.markers[this.idMarcadorSeleccionado];
    this.estacionSeleccionada.latitude = datosActualizados.latitude;
    this.estacionSeleccionada.longitude = datosActualizados.longitude;
    this.estacionSeleccionada.temperature = datosActualizados.temperature;
    this.estacionSeleccionada.ubication = datosActualizados.ubication;
    this.tempMarcadorSeleccionado = datosActualizados.temperature;
  }

  private crearEnMapa(datosEstacion: DtoStation){
    const newMarker = this.generarMarcador(datosEstacion, this.markers.length, false);
    newMarker.addTo(this.map);
    this.markers.push(newMarker);
    this.ajustarMapaConMarcadores();
    this.listarEstaciones(false);
  }

  public onMapReady($event: Leaflet.Map) {
    this.map = $event;
    this.mapListo = true;
    this.validarMovimientoMapa();
  }

  public listarEstaciones(conInicioDeMarcadores: boolean){
     this.mapService.obtenerEstaciones(environment.endpoint).subscribe({
      next: (data: Station[]) =>{
        this.estaciones = data;
        if (this.mapListo && conInicioDeMarcadores){
          this.iniciarMarcadores();
        }
      },
      error: (error) => {
        this.modalNotificaciones.modalBasico(ERROR_ICON, SOLICITUD_ERROR);
        console.log(error);
      }
     });
  }

  public eliminarEstacion(){
    const result = window.confirm(MENSAJE_CONFIRM);
    if(result){
      this.mapService.eliminarEstacion(environment.endpoint, this.estacionSeleccionada.id).subscribe({
        next: (data) =>{
          this.listarEstaciones(true);
          this.cerrarVentanaInformativa();
          this.ocultarAgregarEnModal();
          this.marcadorSeleccionado = null;;
          this.modalNotificaciones.modalBasico(SATISFACTORIO_ICON, SOLICITUD_EXITOSA);
        },
        error: (error) => {
          this.modalNotificaciones.modalBasico(ERROR_ICON, SOLICITUD_ERROR);
          console.log(error);
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
          this.modalNotificaciones.modalBasico(ERROR_ICON, SOLICITUD_ERROR);
          console.log(error);
        }
      });
    }
    else{
      this.modalNotificaciones.modalBasico(ERROR_ICON, INFORMACION_INCORRECTA + this.obtenerErrores(this.formActualizar));
    }
  }

  public crearEstacion(){
    console.log(this.formAgregar.valid);
    if (this.formAgregar.valid){
      let body = this.mapearFormulario(this.formAgregar);

      this.mapService.guardarEstacion(environment.endpoint, body).subscribe({
        next: (response) =>{
          this.crearEnMapa(body);
          this.cerrarVentanaInformativa();
          this.ocultarAgregarEnModal();
          this.formAgregar.reset();
          this.modalNotificaciones.modalBasico(SATISFACTORIO_ICON, SOLICITUD_EXITOSA);
        },
        error: (error) => {
          this.modalNotificaciones.modalBasico(ERROR_ICON, SOLICITUD_ERROR);
          console.log(error);
        }
      });
    }
    else{
      this.modalNotificaciones.modalBasico(ERROR_ICON, INFORMACION_INCORRECTA + this.obtenerErrores(this.formAgregar));
    }
  }

  public iniciarActualizacion(){
    this.mostrarFormularioEnModal();
    this.llenarFormulario(this.estacionSeleccionada);
    this.forzarDeteccionCambios();
  }

  public abrirVentanaInformativa(){
    this.mostrarVentana = true;
    this.ocultarFormularioEnModal()
  }

  public cerrarVentanaInformativa(){
    this.mostrarVentana = false;
    this.ocultarFormularioEnModal();
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
