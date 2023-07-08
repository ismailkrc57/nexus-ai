import {Component, Input} from '@angular/core';
import {PlaceSearchResult} from "../models/place-search-result";

@Component({
  selector: 'app-place-card',
  templateUrl: './place-card.component.html',
  styleUrls: ['./place-card.component.css']
})
export class PlaceCardComponent {
  @Input() data: PlaceSearchResult | undefined;

  constructor() {
  }

  ngOnInit(): void {
  }
}
