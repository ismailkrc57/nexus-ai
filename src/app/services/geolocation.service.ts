import {Injectable} from '@angular/core';

declare const google: any;

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private geocoder: any;

  constructor() {
    this.geocoder = new google.maps.Geocoder();
  }

  getCityName(lat: number, lng: number): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const latlng = new google.maps.LatLng(lat, lng);
      this.geocoder.geocode({'latLng': latlng}, (results: any, status: any) => {
        if (status === google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            const addressComponents = results[0].address_components;
            console.log("results: ", results)
            console.log("addressComponents: ", addressComponents)
            for (const component of addressComponents) {
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_1')) {
                resolve(component.long_name);
                return;
              }
            }
            reject('City name not found.');
          } else {
            reject('No results found.');
          }
        } else {
          reject('Geocoder failed due to: ' + status);
        }
      });
    });
  }
}

