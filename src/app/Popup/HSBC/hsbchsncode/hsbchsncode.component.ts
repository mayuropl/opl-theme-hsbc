import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HsnCodeDetail } from 'src/app/CommoUtils/model/HsnCodeDetail';

@Component({
  selector: 'app-hsbchsncode',
  templateUrl: './hsbchsncode.component.html',
  styleUrl: './hsbchsncode.component.scss'
})
export class HSBCHSNCodeComponent {

  hsnCodes:HsnCodeDetail[] ;
  constructor(public dialogRef: MatDialogRef<HSBCHSNCodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: HSBCHSNCodeComponent,private router:Router) { }

  ngOnInit(): void {
    this.hsnCodes = this.data.hsnCodes
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }
  // rmAddCustomer(){
  //   this.closePopup();
  //   this.router.navigate(['rmAddCustomer'])
  // }
}
