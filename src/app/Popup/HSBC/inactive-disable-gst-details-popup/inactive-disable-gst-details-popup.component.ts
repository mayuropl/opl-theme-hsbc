import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inactive-disable-gst-details-popup',
  templateUrl: './inactive-disable-gst-details-popup.component.html',
  styleUrl: './inactive-disable-gst-details-popup.component.scss'
})
export class InactiveDisableGstDetailsPopupComponent  {

  inAtiveGstInList : String[] = [];
  constructor(public dialogRef: MatDialogRef<InactiveDisableGstDetailsPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string[],private router:Router) {
      this.inAtiveGstInList = this.data;
    }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

}
