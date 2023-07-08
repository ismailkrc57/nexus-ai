import {Component, ViewChild} from '@angular/core';
import {GoogleMap, MapInfoWindow, MapMarker} from '@angular/google-maps';
import {PlaceSearchResult} from "./models/place-search-result";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  fromValue: PlaceSearchResult = {address: ''};
  toValue: PlaceSearchResult = {address: ''};
}
