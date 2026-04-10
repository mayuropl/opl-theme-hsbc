import { data } from 'jquery';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-active-gst-details-popup',
  templateUrl: './active-gst-details-popup.component.html',
  styleUrl: './active-gst-details-popup.component.scss'
})
export class ActiveGstDetailsPopupComponent {

  ativeGstInList : String[] = [];
  constructor(public dialogRef: MatDialogRef<ActiveGstDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[]) {
      this.ativeGstInList = this.data;
      console.log('this.ativeGstInList: ', this.ativeGstInList);
    }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

}
