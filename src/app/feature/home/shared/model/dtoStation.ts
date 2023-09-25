export class DtoStation{
  latitude: number;
  longitude: number;
  temperature: number;
  ubication: string;
  client: string;

  constructor(latitude: string,
              longitude: string,
              temperature: string,
              ubication: string){
    this.client = "Natalia";
    this.latitude = parseFloat(latitude);
    this.longitude = parseFloat(longitude);
    this.temperature = parseFloat(temperature);
    this.ubication = ubication;
  }
}
