import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-hsbc-not-eligible',
  templateUrl: './hsbc-not-eligible.component.html',
  styleUrls: ['./hsbc-not-eligible.component.scss']
})
export class HSBCNotEligibleComponent implements OnInit {

  
  constructor(public dialogRef: MatDialogRef<HSBCNotEligibleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HSBCNotEligibleComponent) { }

  ngOnInit(): void {
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }


}
