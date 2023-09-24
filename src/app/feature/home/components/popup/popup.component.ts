import { Component } from '@angular/core';
import { Station } from '../../shared/model/station';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent {
  public data!: Station;

}
