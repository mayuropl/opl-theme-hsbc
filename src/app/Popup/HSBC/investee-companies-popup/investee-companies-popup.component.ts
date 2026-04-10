import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMethods } from 'src/app/CommoUtils/common-methods';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';
import { MsmeService } from 'src/app/services/msme.service';

@Component({
  selector: 'app-investee-companies-popup',
  templateUrl: './investee-companies-popup.component.html',
  styleUrl: './investee-companies-popup.component.scss'
})
export class InvesteeCompaniesPopupComponent {

  constructor(public dialogRef: MatDialogRef<InvesteeCompaniesPopupComponent>,@Inject(MAT_DIALOG_DATA) public data: any,public dialog: MatDialog, private msmeService: MsmeService, public commonService: CommonService, private router: Router,
        public commonMethod: CommonMethods, private activatedRoute: ActivatedRoute,private fb: FormBuilder) {
     console.log("data",this.data); 
  }

  ngOnInit(): void {
  }

 redirectGetDetails() {
  this.dialogRef.close(true); // returns true to caller
}

closeDialog() {
  this.dialogRef.close(false); // returns false to caller
}


}
