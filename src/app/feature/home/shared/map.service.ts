import { Injectable } from '@angular/core';
import { HttpGeneralService } from 'src/app/core/services/http-general.service';
import { Station } from './model/station';

@Injectable()
export class MapService {

  constructor(protected http: HttpGeneralService) {}

  public obtenerEstaciones(endpoint: string){
    return this.http.doGet<Station[]>(endpoint);
  }

  public guardarEstacion(endpoint: string, body: any, options?: any){
    return this.http.doPost(endpoint, body, options);
  }
}
