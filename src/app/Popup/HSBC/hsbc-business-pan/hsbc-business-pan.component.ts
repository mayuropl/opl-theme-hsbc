import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hsbc-business-pan',
  templateUrl: './hsbc-business-pan.component.html',
  styleUrls: ['./hsbc-business-pan.component.scss']
})
export class HSBCBusinessPANComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<HSBCBusinessPANComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HSBCBusinessPANComponent,private router:Router) { }

  ngOnInit(): void {
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }
  rmAddCustomer(){
    this.closePopup();
    this.router.navigate(['/hsbc/rmAddCustomer'])
  }
}
