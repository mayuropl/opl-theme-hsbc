import { Component,Inject   } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-new-incorporation-view-popup',
  templateUrl: './new-incorporation-view-popup.component.html',
  styleUrl: './new-incorporation-view-popup.component.scss'
})

export class NewIncorporationViewPopupComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public corporation: any) {}

  ngOnInit() {
    console.log(this.corporation);  // Debugging: Check the corporation data
  }
}
