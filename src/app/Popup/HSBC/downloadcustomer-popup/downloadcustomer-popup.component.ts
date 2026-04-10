import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-downloadcustomer-popup', 
  templateUrl: './downloadcustomer-popup.component.html',
  styleUrl: './downloadcustomer-popup.component.scss'
})
export class DownloadcustomerPopupComponent {

  constructor(public dialogRef: MatDialogRef<DownloadcustomerPopupComponent>,) {}

  onOk() {
    this.dialogRef.close(true); 
  }
  
  onCancel() {
    this.dialogRef.close(false);
  }

}
