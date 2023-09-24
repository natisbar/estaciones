import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Station } from '../../shared/model/station';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnChanges{

  @Input()
  data!: Station;
  @Input()
  mostrarVentana!: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    console.log("inicio PopupComponent ");
    console.log(this.data.ubication);
    this.cdr.detectChanges();
    // this.mostrarVentana = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("ENTRE A CAMBIOS");
    console.log( this.mostrarVentana);
    const nuevoValor = changes["mostrarVentana"].currentValue;
    console.log('Valor de mostrarVentana ha cambiado a:', nuevoValor);
    this.cdr.detectChanges();

  }

  cerrarVentanaInformativa(){
    this.mostrarVentana = false;

  }

}
