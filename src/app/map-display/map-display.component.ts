import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {PlaceSearchResult} from "../models/place-search-result";
import {BehaviorSubject, map} from "rxjs";
import {GoogleMap, MapDirectionsService, MapMarker} from "@angular/google-maps";
import {GeolocationService} from "../services/geolocation.service";

@Component({
  selector: 'app-map-display',
  templateUrl: './map-display.component.html',
  styleUrls: ['./map-display.component.css']
})
export class MapDisplayComponent implements OnInit {
  @ViewChild('map', {static: true})
  map!: GoogleMap;

  @Input()
  from: PlaceSearchResult | undefined;

  @Input()
  to: PlaceSearchResult | undefined;

  markerPositions: google.maps.LatLng[] = [];
  markerPositionsTemp: google.maps.LatLng[] = [];

  waypoints: google.maps.DirectionsWaypoint[] = [];

  zoom = 5;

  directionsResult$ = new BehaviorSubject<google.maps.DirectionsResult | undefined>(undefined);

  markerOptions = {
    icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
    draggable: true,
  }
  infoWindowPosition: google.maps.LatLngLiteral = {lat: 0, lng: 0};
  infoWindowText: string | undefined;

  showInfoWindow(markerPosition: google.maps.LatLng) {
    this.infoWindowPosition = {
      lat: markerPosition.lat(),
      lng: markerPosition.lng()
    }
    console.log("this.infoWindowPosition", this.infoWindowPosition)
    this.infoWindowText = 'Your Location';
    console.log(this.infoWindowText);
  }


  constructor(private directionsService: MapDirectionsService, private geoLocation: GeolocationService) {
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    const fromLocation = this.from?.location;
    const toLocation = this.to?.location;

    if (fromLocation && toLocation) {
      this.getDirections(fromLocation, toLocation);
    } else if (fromLocation) {
      this.gotoLocation(fromLocation);
    } else if (toLocation) {
      this.gotoLocation(toLocation);
    }
  }

  gotoLocation(location: google.maps.LatLng) {
    this.markerPositions = [location];
    this.map.panTo(location);
    this.zoom = 17;
    this.directionsResult$.next(undefined);
  }

  getDirections(
    fromLocation: google.maps.LatLng,
    toLocation: google.maps.LatLng
  ) {
    const request: google.maps.DirectionsRequest = {
      destination: toLocation,
      origin: fromLocation,
      waypoints: [],
      travelMode: google.maps.TravelMode.DRIVING,
    };

    this.directionsService
      .route(request)
      .pipe(map((response) => response.result))
      .subscribe(async (res) => {
        this.directionsResult$.next(res);
        this.markerPositions = [];

        if (res && res.routes && res.routes.length > 0) {
          const route = res.routes[0];
          const cityList: string[] = [];
          for (const leg of route.legs) {
            for (const step of leg.steps) {
              const cities = await this.extractCitiesFromStep(step);
              cityList.push(...cities);
            }
            route.overview_path.forEach((path) => {
              this.markerPositionsTemp.push(new google.maps.LatLng(path.lat(), path.lng()));
            });
          }
        }
        this.markerPositionsTemp.forEach((position) => {
          this.markerPositions.push(position);
        });
        //this.addAndRemoveMarkers();
      });
  }

  addAndRemoveMarkers() {
    // İşaretçi pozisyonlarını markerPositions dizisine sırayla ekleyin
    this.markerPositionsTemp.forEach((position, index) => {
      setTimeout(() => {
        this.markerPositions.pop();
        this.markerPositions.push(position);

        // İkinci işaretçiyi ekledikten sonra önceki işaretçiyi silin
        if (index === 1) {
          this.markerPositions.shift();
        }
      }, index * 100); // Her bir işaretçi arasında 1 saniye bekleme süresi
    });
  }


  private async extractCitiesFromStep(step: google.maps.DirectionsStep): Promise<string[]> {
    this.waypoints.push({location: step.start_location.toJSON()});
    const cities: string[] = [];
    await new google.maps.Geocoder().geocode({location: step.start_location.toJSON()}, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
          let addressComponents: google.maps.GeocoderAddressComponent[] = [];
          if (results) {
            addressComponents = results[0].address_components;
          }
          const cityName = this.getCityNameFromAddressComponents(addressComponents);
          if (cityName) {
            cities.push(cityName);
          }
        }
      }
    );
    return cities;
  }

  private getCityNameFromAddressComponents(addressComponents: google.maps.GeocoderAddressComponent[]): string | null {
    let city: string | null = null;
    let district: string | null = null;

    for (const component of addressComponents) {
      const types = component.types;

      if (types.includes('administrative_area_level_1')) {
        city = component.long_name;
      }

      if (types.includes('administrative_area_level_2')) {
        district = component.long_name;
      }
    }

    // Return either the city name or the city name followed by the district name
    if (city) {
      return district ? `${city}, ${district}` : city;
    }

    return null;
  }

}
