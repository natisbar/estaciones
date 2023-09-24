import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpGeneralService {

  constructor(public http: HttpClient) {}

  public doPost(url: string, body: any, options?: any){
    return this.http.post<any>(url, body, options);
  }

  public doGet<T>(url: string){
    return this.http.get<T>(url)
  }

  getHttpHeaders(): HttpHeaders {
    let headers = new HttpHeaders().set('access-control-allow-origin',"*");
    // let headers = new HttpHeaders();
    headers.set('xhr-name', 'consultar registros');
    return headers;
  }
}
