import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-hsbc-thankyou-popup',
  templateUrl: './hsbc-thankyou-popup.component.html',
  styleUrls: ['./hsbc-thankyou-popup.component.scss']
})
export class HsbcThankyouPopupComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<HsbcThankyouPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HsbcThankyouPopupComponent) { }

  ngOnInit(): void {
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

}
