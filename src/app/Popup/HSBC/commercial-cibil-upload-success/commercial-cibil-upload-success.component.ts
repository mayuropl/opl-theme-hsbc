import { Component, Inject, OnInit, Optional } from '@angular/core';
import { HSBCBusinessPANComponent } from '../hsbc-business-pan/hsbc-business-pan.component';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MsmeService } from 'src/app/services/msme.service';
import { CommonService } from 'src/app/CommoUtils/common-services/common.service';

@Component({
  selector: 'app-commercial-cibil-upload-success',
  templateUrl: './commercial-cibil-upload-success.component.html',
  styleUrl: './commercial-cibil-upload-success.component.scss'
})
export class CommercialCibilUploadSuccessComponent implements OnInit{
  constructor(
    public dialogRef: MatDialogRef<HSBCBusinessPANComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,private msmeService: MsmeService,private commonService: CommonService
  ) {}

  ngOnInit(): void {
    console.log(this.data.totalEntry);
    console.log("batchId",this.data.batchId);
  }
  reload(): void {
    window.location.reload();
    this.data.this.fetchBulkUploadHistory(null, true);
  }

  closePopup(data?): void {
    this.dialogRef.close(data);
  }

  procced(){
    this.closePopup();
    // window.location.reload();
  }

}
